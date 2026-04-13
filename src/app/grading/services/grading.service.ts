import { computed, effect, inject, Injectable, linkedSignal, signal, untracked } from "@angular/core";
import { Store } from "../store/store";
import { AnnotationIdentity, AnnotationScoreShape, AnnotationShape, AnnotationToApply, GradeSummary } from "../store/model/types";
import { GeneralScoreDB, Grading, ParticipantSectionTranscript, QuestionAnnotation, QuestionPage, SchemeMarkCategory, SchemePageData, SchemeQuestionSectionScoreScoreDB, SchemeQuestionSectionsTransformed, SchemeQuestionsTransformed, SchemeScoreBoundary } from "../model/types";
import { HotToastService } from "@ngxpert/hot-toast";
import { DrawingAndWritingStore } from "../grade/canvas/sevices/canvas-store";
import { Store as DrawingStore } from '../grade/canvas/model/store.mode'

@Injectable({ providedIn: 'root' })
export class GradingService {
    private _store = inject(Store)
    private _toast = inject(HotToastService)
    private _drawingStore = inject(DrawingAndWritingStore)

    store = computed(() => this._store.store())
    currentQuestionIndex = computed(() => this.store().currentQuestionIndex)
    currentQuestion = computed(() => this.store().questions[this.currentQuestionIndex()])
    currentQuestionMarkingGuide = computed(() => this.store()?.markingGuide?.questions.find((q) => q.item_id === this.currentQuestion().item.id))
    currentQuestionHasResponse = computed(() => this.currentQuestion()?.item_score.un_graded_response.length)
    questionCurrentSectionIndex = computed(() => this.store().questionCurrentSectionIndex)
    currentPage = computed(() => this._drawingStore.store().currentPage)

    lastCurrentQuestionId = signal<string | null>(null)
    lastCurrentSectionIndex = signal<number | null>(null)

    annotationToApply = signal<AnnotationToApply | null>(null)
    annotationShapes = signal(AnnotationShape)
    markTypes = signal(SchemeMarkCategory)
    gradeSummary = signal<{ id: string, summary: GradeSummary }[]>([])

    currentQuestionSectionCorrectScores = computed(() => this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex]?.scores_correct)
    currentQuestionSectionPenaltyScores = computed(() => this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex]?.scores_penalty)
    currentQuestionSectionViolationScores = computed(() => this.currentQuestionMarkingGuide()?.sections?.[this.store().questionCurrentSectionIndex]?.scores_violation)
    generalCorrectScores = computed(() => this.store().markingGuide?.general_scores_correct ?? [])
    generalPenaltyScores = computed(() => this.store().markingGuide?.general_scores_penalty ?? [])
    generalViolationScores = computed(() => this.store().markingGuide?.general_scores_violation ?? [])

    currentQuestionSectionsAnnotations = signal<{ section: string, annotations: QuestionAnnotation[] }[]>([])
    questionsGradedStatus = signal<{ questionId: string, questionIndex: number, sectionsUngraded: SchemeQuestionSectionsTransformed[], status: boolean }[]>([])
    questionsPagesStatus = signal<{ questionId: string, questionIndex: number, ungradedPages: QuestionPage[], status: boolean }[]>([])

    isGradingSeed = linkedSignal(() => this.store().gradingInfo?.isSeed)

    gradingStarted = signal(false)

    useConstraints = computed(() => {
        // todo: pending on the type of grading. e.g seed
        // if seed, onload don't use constraints
        // if not seed, onload use constraints
        if (this.isGradingSeed() && !this.gradingStarted()) {
            return false
        } else if (this.isGradingSeed() && this.gradingStarted()) {
            return true
        } else {
            return true
        }
    })

    onCurrentQuestionChanges = effect(() => {
        if (this.currentQuestion() && this.lastCurrentQuestionId() !== this.currentQuestion().item.id) {
            untracked(() => {
                this.questionChangeHandler()
                this.updateQuestionGradingStatus()
            });
        }
    })

    questionChangeHandler() {
        this.lastCurrentQuestionId.set(this.currentQuestion().item.id)

        this._store.updateStore({ questionCurrentSectionIndex: 0 })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.sectionIndexChangeHandler()
    }

    onSectionIndexChanges = effect(() => {
        if (this.questionCurrentSectionIndex() >= 0 && this.lastCurrentSectionIndex() !== this.questionCurrentSectionIndex()) {
            untracked(() => {
                this.sectionIndexChangeHandler()
            });
        }
    })

    sectionIndexChangeHandler() {
        const section = this.currentQuestionMarkingGuide()?.sections[this.store().questionCurrentSectionIndex]

        this.lastCurrentSectionIndex.set(this.store().questionCurrentSectionIndex)

        if (!section) {
            return
        }

        const annotationToApply = new AnnotationToApply()
        this.annotationToApply.set({ ...annotationToApply, section })
    }

    onCurrentQuestionSectionAnnotation = effect(() => {
        if (this.store()) {
            const questionAnnotations = this.currentQuestion()?.annotations;

            if (!questionAnnotations?.length) {
                const sectionsAnnotations = this.currentQuestionMarkingGuide()?.sections.map(section => {
                    return {
                        section: section.id,
                        annotations: []
                    }
                })
                this.currentQuestionSectionsAnnotations.set(sectionsAnnotations ?? [])
                return
            }

            return untracked(() => {
                const sectionsAnnotations = this.currentQuestionMarkingGuide()?.sections.map(section => {
                    const sectionAnnotations = questionAnnotations.filter(ann => ann.question_section_id == section.id)
                    return {
                        section: section.id,
                        annotations: sectionAnnotations
                    }
                })

                this.currentQuestionSectionsAnnotations.set(sectionsAnnotations ?? [])
            })
        }
    })

    questionsGradedStatusTracker = effect(() => {
        if (this.store()) {
            return untracked(() => {
                const questionsGradedStatus = this.store().questions.map((q, index) => {
                    const sectionsUngraded = this.store().markingGuide?.questions[index]?.sections.map(s => {

                        const sectionsAnnotations = this.store().markingGuide?.questions[index]?.sections.map(section => {
                            const sectionAnnotations = q.annotations.filter(ann => ann.question_section_id == section.id)
                            return {
                                section: section.id,
                                annotations: sectionAnnotations
                            }
                        })

                        const section = sectionsAnnotations?.find(section => section.section == s.id)
                        const unversionedAnnotations = section?.annotations?.filter(ann => !ann.identity.versioned)

                        if (!unversionedAnnotations?.length && !s.not_attempted) {
                            return s
                        }

                        return []
                    }).flat() ?? []

                    return {
                        questionId: q.item.id,
                        questionIndex: index,
                        sectionsUngraded,
                        status: !sectionsUngraded?.length
                    }
                })

                this.questionsGradedStatus.set(questionsGradedStatus)
            })
        }
    })

    allQuestionsSectionsGraded = computed(() => {
        return this.questionsGradedStatus().every(q => q.status)
    })

    questionsPagesGradedTracker = effect(() => {
        if (this.store()) {
            return untracked(() => {
                const questionsGradedStatus = this.store().questions.map((q, index) => {
                    const ungradedPages = q?.pages.filter(p => !p.blank).map(p => {
                        const questionAnnnotations = q.annotations?.filter(ann => ann.page == p.page)
                        const unversionedAnnotations = questionAnnnotations?.filter(ann => !ann.identity.versioned)

                        if (!unversionedAnnotations?.length) {
                            return p
                        }

                        return []
                    }).flat() ?? []

                    return {
                        questionId: q.item.id,
                        questionIndex: index,
                        ungradedPages,
                        status: !ungradedPages?.length
                    }
                })

                this.questionsPagesStatus.set(questionsGradedStatus)
            })
        }
    })

    allQuestionsPagesGraded = computed(() => {
        return this.questionsPagesStatus().every(q => q.status)
    })


    onValidAnnotationToApply = effect(() => {
        const annotationToApply = this.annotationToApply()
        if (!annotationToApply) { return }

        untracked(() => {
            const valid = this.validateAnnotationToApply(annotationToApply)
            if (valid) {
                this.applySectionScore()
                this.updateQuestionGradingStatus()
            }
        });
    })

    validateAnnotationToApply(annotationToApply: AnnotationToApply) {
        const ann = annotationToApply

        if (!ann.section || !ann.score) {
            return false
        }

        if (ann.section.id !== ann.score.question_section_id && ann.score.boundary !== SchemeScoreBoundary.GENERAL) {
            this._toast.error('This score cannot be applied to this section', { position: 'bottom-center' })
            return false
        }

        if (ann.score.usage >= ann.score.max_occurrence) {
            this._toast.error('You have exceeded the usage of this score', { position: 'bottom-center' })
            return
        }

        if (!ann.position.length) {
            return
        }

        if (ann.applied) {
            this._toast.error('This score has already been applied', { position: 'bottom-center' })
            return
        }

        this._toast.success('Score applied successfully', { position: 'bottom-center' })
        return true
    }

    applySectionScore() {
        const ann = this.annotationToApply()

        if (!ann) {
            return
        }

        const question = this.currentQuestion()
        if (!question) {
            return
        }

        const identity = new AnnotationIdentity()
        identity.questionId = question.item.id
        identity.sectionId = ann.section!.id
        identity.scoreId = ann.score!.id
        identity.scoreUsage = ann.score!.usage + 1
        identity.scoreMaxOccurence = ann.score!.max_occurrence
        identity.id = Date.now().toString()
        identity.versioned = false
        identity.applied = true
        identity.highlight = false
        identity.shape = this.getAnnotationShape(ann.score!, ann.shape)

        const annotation = new QuestionAnnotation()
        annotation.identity = identity
        annotation.position = ann.position

        annotation.page = this.currentPage()

        annotation.score = ann.gradeScore
        annotation.markers_discretion = ann.score!.marker_discretion
        annotation.comment = JSON.stringify(identity)
        annotation.score_id = ann.score!.id
        annotation.mark_category = ann.score!.mark_category
        annotation.mark_type_id = ann.score!.mark_type_id
        annotation.name = ann.score!.name
        annotation.boundary = ann.score!.boundary

        const currentSection = this.currentQuestionMarkingGuide()?.sections[this.store().questionCurrentSectionIndex]
        annotation.question_section_id = ann.score!.question_section_id ?? currentSection?.id
        annotation.item_id = question.item.id
        annotation.code = ann.score!.code

        const questionAnnotations = this.store().questions[this.currentQuestionIndex()].annotations
        questionAnnotations?.push(annotation)

        const questions = this.store().questions
        questions[this.currentQuestionIndex()].annotations = questionAnnotations

        this._store.updateStore({ questions })

        this.updateGradingSummary()
        this.setQuestionScoreUsage()

        const annotationToApply = new AnnotationToApply()
        this.annotationToApply.set({ ...annotationToApply, section: ann.section })
    }

    getAnnotationShape(score: SchemeQuestionSectionScoreScoreDB, shape: AnnotationScoreShape) {
        if (score.mark_category === 'SCORE') {
            return shape.correct ?? AnnotationShape.CHECK
        }
        if (score.mark_category === 'PENALTY') {
            return shape.penalty ?? AnnotationShape.X
        }
        if (score.mark_category === 'VIOLATION') {
            return shape.violation ?? AnnotationShape.BAN
        }

        return AnnotationShape.NONE
    }

    formatAndSaveMarkginGudeResponse(res: SchemePageData): SchemePageData {
        res.questions = res.questions.map(q => {
            return {
                ...q,
                sections: q?.sections?.map(s => ({
                    ...s,
                    not_attempted: false
                }))
            }
        })

        return res
    }

    setQuestionScoreUsage(res?: SchemePageData) {
        const markingGuide = res ?? this.store().markingGuide
        if (!markingGuide) {
            return
        }


        markingGuide.questions = markingGuide?.questions.map(q => {
            return {
                ...q,
                sections: q?.sections?.map(s => ({
                    ...s,
                    scores_correct: s?.scores_correct?.map(score => ({
                        ...score,
                        usage: this.getScoreUsage(q, score)
                    })),
                    scores_penalty: s?.scores_penalty?.map(score => ({
                        ...score,
                        usage: this.getScoreUsage(q, score)
                    })),
                    scores_violation: s?.scores_violation?.map(score => ({
                        ...score,
                        usage: this.getScoreUsage(q, score)
                    }))
                }))
            }
        })

        markingGuide.general_scores_correct = markingGuide.general_scores_correct?.map(score => ({
            ...score,
            usage: this.getGeneralScoreUsage(score)
        }))

        markingGuide.general_scores_penalty = markingGuide.general_scores_penalty?.map(score => ({
            ...score,
            usage: this.getGeneralScoreUsage(score)
        }))

        markingGuide.general_scores_violation = markingGuide.general_scores_violation?.map(score => ({
            ...score,
            usage: this.getGeneralScoreUsage(score)
        }))

        this._store.updateStore({ markingGuide })
    }

    getGeneralScoreUsage(score: GeneralScoreDB) {
        const annotations = this.store().questions.flatMap(q => q.annotations)
        const usage = annotations?.filter((ann) => ann.mark_category === this.markTypes().SCORE && ann.score_id === score.id)
        if (!usage?.length) {
            return 0
        }

        return usage.length
    }

    getScoreUsage(question: SchemeQuestionsTransformed, score: SchemeQuestionSectionScoreScoreDB) {
        const q = this.store().questions.find(q => q.item.id === question.item_id)
        if (!q) {
            return 0
        }

        const annotations = q.annotations.filter(ann => !ann.identity.versioned)

        if (score.mark_category === 'SCORE') {
            const usage = annotations?.filter((ann) => ann.mark_category === this.markTypes().SCORE && ann.score_id === score.id && ann.item_id === question.item_id)
            if (!usage?.length) {
                return 0
            }

            return usage.length
        } else if (score.mark_category === 'PENALTY') {
            const usage = annotations?.filter((ann) => ann.mark_category === this.markTypes().PENALTY && ann.score_id === score.id && ann.item_id === question.item_id)
            if (!usage?.length) {
                return 0
            }
            return usage.length
        } else if (score.mark_category === 'VIOLATION') {
            const usage = annotations?.filter((ann) => ann.mark_category === this.markTypes().VIOLATION && ann.score_id === score.id && ann.item_id === question.item_id)
            if (!usage?.length) {
                return 0
            }
            return usage.length
        } else {
            return 0
        }
    }

    formatAndSaveQuestions(res: ParticipantSectionTranscript[]): ParticipantSectionTranscript[] {
        const questions = res.map(q => {
            const pages: QuestionPage[] = [];

            const createPage = (index: number, questionId: string, savedPage?: QuestionPage): QuestionPage => {
                const page = new QuestionPage();
                if (savedPage) {
                    page.allowNavigation = this.useConstraints() ? savedPage.allowNavigation : true;
                    page.page = savedPage.page;
                    page.questionId = savedPage.questionId;
                    page.blank = savedPage.blank;
                } else {
                    page.allowNavigation = this.useConstraints() ? index === 0 : true;
                    page.page = index;
                    page.questionId = questionId;
                    page.blank = false;
                }
                return page;
            };

            if (q.item_score.un_graded_response.length) {
                const jsonResponse = JSON.parse(q.item_score.un_graded_response[0]) as DrawingStore;
                const savedPages = q.item_score.graded
                    ? JSON.parse(q.item_score.manual_grade_remark || JSON.stringify({ pages: [] })) as { pages: QuestionPage[] }
                    : null;

                jsonResponse.pages.forEach((_, index) => {
                    const savedPage = savedPages?.pages.find(p => p.questionId === q.item.id);
                    pages.push(createPage(index, q.item.id, savedPage));
                });
            } else {
                pages.push(createPage(0, q.item.id));
            }

            return {
                ...q,
                annotations: [],
                gradingStatus: {
                    visited: false,
                    notVisited: false,
                    graded: false,
                    blanks: 0
                },
                pages
            };
        });

        return questions
    }

    updateGradingSummary() {
        const summary: { id: string, summary: GradeSummary }[] = []

        this.store().questions.forEach(question => {
            const result = new GradeSummary()

            question.annotations
                .filter(ann => !ann.identity.versioned)
                .forEach(ann => {
                    const value = ann.score || 0

                    switch (ann.mark_category) {
                        case this.markTypes().SCORE:
                            result.correct += value
                            break;
                        case this.markTypes().PENALTY:
                            result.penalty += value
                            break;
                        case this.markTypes().VIOLATION:
                            result.violation += value
                            break;
                    }
                })

            result.score = (result.correct - result.penalty) - result.violation
            const entry = { id: question.item.id, summary: result }
            summary.push(entry)
        })

        this.gradeSummary.set(summary)
    }

    updateQuestionGradingStatus() {
        const questions = this.store().questions.map(question => {
            const gradingStatus = {
                visited: false,
                notVisited: false,
                graded: false,
                blanks: 0
            }

            const blanksMarked = question.pages.filter(p => p.blank).length

            if (question.annotations.length > 0) {
                gradingStatus.visited = true
            } else if (blanksMarked > 0) {
                gradingStatus.visited = true
            } else {
                gradingStatus.notVisited = true
            }

            if (question.annotations.length > 0) {
                gradingStatus.graded = false
            }

            gradingStatus.blanks = blanksMarked

            return {
                ...question,
                gradingStatus
            }
        })

        this._store.updateStore({ questions })
    }

    unHighlightCurrentQuestionnnotations() {
        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.annotations.forEach(ann => {
            ann.identity.highlight = false
        })

        this._store.updateStore({ questions })
    }

    highlightAnnotation(annotation: QuestionAnnotation) {
        this.unHighlightCurrentQuestionnnotations()

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        const ann = question.annotations.find(ann => ann.identity.id === annotation.identity.id)
        if (!ann) {
            return
        }

        ann.identity.highlight = true
        this._store.updateStore({ questions })
    }

    highlightedAnnotation = computed(() => {
        if (!this.store()) {
            return
        }

        const ann = this.currentQuestion().annotations.find(ann => ann.identity.highlight)
        return ann
    })

    versionAnnotation() {
        if (!this.highlightedAnnotation()) {
            return
        }

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]
        question.annotations.forEach(ann => {
            if (ann.identity.highlight) {
                ann.identity.versioned = true

                const json = JSON.parse(ann.comment)
                json.versioned = true
                ann.comment = JSON.stringify(json)
            }
        })

        this._toast.success('Annotation deleted successfully')
        this._store.updateStore({ questions })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
    }

    currentPageIsBlank = computed(() => {
        const page = this.store().questions[this.currentQuestionIndex()]?.pages?.find((page) => page.page === this.currentPage())
        return page?.blank
    })

    markPageAsBlank() {
        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.pages.forEach(p => {
            if (p.page == this.currentPage()) {
                p.blank = true
            }
        })
        question.annotations.filter((ann) => ann.page == this.currentPage()).forEach(ann => {
            ann.identity.versioned = true
        })

        this._store.updateStore({ questions })

        this._toast.success('Page marked as blank', { position: 'bottom-center' })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
        this.allowPageNavigation()
    }

    unMarkPageAsBlank() {
        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.pages.forEach(p => {
            if (p.page == this.currentPage()) {
                p.blank = false
            }
        })

        this._store.updateStore({ questions })

        this._toast.success('Page unmarked as blank', { position: 'bottom-center' })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
    }

    undoLastScore() {
        this.unHighlightCurrentQuestionnnotations()

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        const pageAnnotations = question.annotations.filter((ann) => ann.page === this.currentPage())
        const itemToRemove = pageAnnotations.pop()

        if (!itemToRemove) {
            this._toast.error('You have no score to undo', { position: 'bottom-center' })
            return
        }

        if (itemToRemove.identity.versioned) {
            this._toast.error('This score has been deleted', { position: 'bottom-center' })
            return
        }

        question.annotations = question.annotations.filter((ann) => ann.identity.id !== itemToRemove?.identity.id)

        this._store.updateStore({ questions })

        this._toast.success('Score undone successfully', { position: 'bottom-center' })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
    }

    allowPageNavigation() {
        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.pages.forEach(p => {
            if (p.page == this.currentPage() + 1) {
                p.allowNavigation = true
            }
        })

        this._store.updateStore({ questions })
        this._toast.success('Page navigation allowed', { position: 'bottom-center' });
    }

    markCurrentSectionAsNotAttempted() {
        const markingGuide = this.store().markingGuide
        markingGuide.questions = markingGuide.questions.map(q => {
            return {
                ...q,
                sections: q?.sections?.map(s => {
                    if (s.id === this.currentQuestionMarkingGuide()?.sections[this.store().questionCurrentSectionIndex].id && q.item_id === this.currentQuestion().item.id) {
                        return {
                            ...s,
                            not_attempted: true
                        }
                    }
                    return s
                })
            }
        })

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.annotations.forEach((ann) => {
            if (ann.question_section_id === this.currentQuestionMarkingGuide()?.sections[this.store().questionCurrentSectionIndex].id) {
                ann.identity.versioned = true
            }
        })

        this._store.updateStore({ markingGuide, questions })

        this._toast.success('Section unmarked as not attempted', { position: 'bottom-center' })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
    }

    undoMarkCurrentSectionAsNotAttempted() {
        const markingGuide = this.store().markingGuide
        markingGuide.questions = markingGuide.questions.map(q => {
            return {
                ...q,
                sections: q?.sections?.map(s => {
                    if (s.id === this.currentQuestionMarkingGuide()?.sections[this.store().questionCurrentSectionIndex].id && q.item_id === this.currentQuestion().item.id) {
                        return {
                            ...s,
                            not_attempted: false
                        }
                    }
                    return s
                })
            }
        })

        this._store.updateStore({ markingGuide })

        this._toast.success('Section unmarked as not attempted', { position: 'bottom-center' })
        this.setQuestionScoreUsage()
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
    }

    formatGradingPayload() {
        const payload: Grading[] = []

        this.store().questions.forEach((question, index) => {
            const grading = new Grading()

            const questionGradeSummary = this.gradeSummary().find((summary) => summary.id === question.item.id)
            if (!questionGradeSummary) {
                this._toast.error(`You have no score to submit for question ${index + 1}`, { position: 'bottom-center' })
                return
            }

            grading.annotations = question.annotations
            grading.include_penalty = question.item_score.has_penalty
            grading.item_id = question.item.id
            grading.score = questionGradeSummary.summary.score
            grading.remark = JSON.stringify({ pages: question.pages })

            payload.push(grading)
        })

        return payload
    }
}   
