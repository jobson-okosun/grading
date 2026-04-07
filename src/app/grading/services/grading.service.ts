import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { Store } from "../store/store";
import { AnnotationIdentity, AnnotationToApply, GradeSummary } from "../store/model/types";
import { ParticipantSectionTranscript, QuestionAnnotation, QuestionPage, SchemeMarkCategory, SchemePageData, SchemeQuestionSectionScoreScoreDB } from "../model/types";
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
    currentQuestion = computed(() => this.store().currentQuestion)
    questionCurrentSectionIndex = computed(() => this.store().questionCurrentSectionIndex)
    currentPage = computed(() => this._drawingStore.store().currentPage)

    lastCurrentQuestionIndex = signal<number | null>(null)
    lastCurrentQuestionId = signal<string | null>(null)
    lastCurrentSectionIndex = signal<number | null>(null)

    annotationToApply = signal<AnnotationToApply | null>(null)
    markTypes = signal(SchemeMarkCategory)
    gradeSummary = signal<{ id: string, summary: GradeSummary }[]>([])


    onQuestionIndexChanges = effect(() => {
        if (this.currentQuestionIndex() >= 0 && this.lastCurrentQuestionIndex() !== this.currentQuestionIndex()) {
            this.questionIndexChangeHandler()
        }
    })

    onCurrentQuestionChanges = effect(() => {
        if (this.store().currentQuestion && this.lastCurrentQuestionId() !== this.currentQuestion()?.question.item.id) {
            this.questionChangeHandler()
            this.updateQuestionGradingStatus()
        }
    })

    questionIndexChangeHandler() {
        if (!(this.store().questions.length > 0)) {
            return
        }

        this.lastCurrentQuestionIndex.set(this.currentQuestionIndex())

        const question = this.store().questions[this.currentQuestionIndex()]
        this._store.updateStore({ currentQuestion: { question } })
    }

    questionChangeHandler() {
        const question = this.store().currentQuestion
        if (!question) {
            return
        }

        const gradingGuide = this.store().markingGuide.questions.find((q) => q.item_id === question.question.item.id)

        this.lastCurrentQuestionId.set(question.question.item.id)

        this._store.updateStore({
            currentQuestion: {
                ...question,
                gradingGuide
            },
            questionCurrentSectionIndex: 0
        })

        this.updateGradingSummary()
        this.sectionIndexChangeHandler()
    }

    onSectionIndexChanges = effect(() => {
        if (this.questionCurrentSectionIndex() >= 0 && this.lastCurrentSectionIndex() !== this.questionCurrentSectionIndex()) {
            this.sectionIndexChangeHandler()
        }
    })

    sectionIndexChangeHandler() {
        const question = this.store().currentQuestion
        if (!question) {
            return
        }

        const gradingGuide = this.store().markingGuide.questions.find((q) => q.item_id === question.question.item.id)
        const section = gradingGuide?.sections[this.store().questionCurrentSectionIndex]

        const sectionCorrectScores = section?.scores_correct
        const sectionPenaltyScores = section?.scores_penalty
        const sectionViolationScores = section?.scores_violation

        this.lastCurrentSectionIndex.set(this.store().questionCurrentSectionIndex)

        this._store.updateStore({
            currentQuestion: {
                ...question,
                sectionCorrectScores,
                sectionPenaltyScores,
                sectionViolationScores,
            }
        })

        if (!section) {
            return
        }

        const annotationToApply = new AnnotationToApply()
        this.annotationToApply.set({ ...annotationToApply, section })
    }

    onValidAnnotationToApply = effect(() => {
        const annotationToApply = this.annotationToApply()
        if (!annotationToApply) {
            return
        }

        const valid = this.validateAnnotationToApply(annotationToApply)
        if (!valid) {
            return
        }

        this.applySectionScore()
        this.updateQuestionGradingStatus()
    })

    validateAnnotationToApply(annotationToApply: AnnotationToApply) {
        const ann = annotationToApply

        if (!ann.section || !ann.score) {
            return false
        }

        if (ann.section.id !== ann.score.question_section_id) {
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

        const question = this.store().currentQuestion
        if (!question) {
            return
        }

        const identity = new AnnotationIdentity()
        identity.questionId = question.question.item.id
        identity.sectionId = ann.section!.id
        identity.scoreId = ann.score!.id
        identity.scoreUsage = ann.score!.usage + 1
        identity.scoreMaxOccurence = ann.score!.max_occurrence
        identity.id = Date.now().toString()
        identity.versioned = false
        identity.applied = true
        identity.highlight = false
        identity.label = this.getAnnotationLabelType(ann.score!)

        const annotation = new QuestionAnnotation()
        annotation.identity = identity
        annotation.position = ann.position

        // todo: fix when drawing store is implemented
        annotation.page = this.currentPage()

        annotation.score = ann.gradeScore
        annotation.markers_discretion = ann.score!.marker_discretion
        // todo: When fixing versioning, after an annotation has been versioned, also update the comment:(JSON.stringify(identity))
        annotation.comment = JSON.stringify(identity)
        annotation.score_id = ann.score!.id
        annotation.mark_category = ann.score!.mark_category
        annotation.mark_type_id = ann.score!.mark_type_id
        annotation.name = ann.score!.name
        annotation.boundary = ann.score!.boundary
        annotation.question_section_id = ann.score!.question_section_id
        annotation.item_id = question.question.item.id
        annotation.code = ann.score!.code

        // increase the usage of the score and update the store
        this.updateScoreUsage(ann.score!)

        const questionAnnotations = this.store().questions[this.currentQuestionIndex()].annotations
        questionAnnotations?.push(annotation)


        // update this current question in the store
        this._store.updateStore({
            currentQuestion: {
                ...this.store().currentQuestion,
                question: {
                    ...this.store().currentQuestion?.question,
                    annotations: questionAnnotations
                }
            }
        })

        this.updateGradingSummary()

        const annotationToApply = new AnnotationToApply()
        this.annotationToApply.set({ ...annotationToApply, section: ann.section })
    }


    getAnnotationLabelType(score: SchemeQuestionSectionScoreScoreDB) {
        if (score.mark_category === 'SCORE') {
            return 'CORRECT'
        }
        if (score.mark_category === 'PENALTY') {
            return 'PENALTY'
        }
        if (score.mark_category === 'VIOLATION') {
            return 'VIOLATION'
        }
        return 'NONE'
    }

    updateScoreUsage(score: SchemeQuestionSectionScoreScoreDB, subtract = false) {
        if (score.mark_category === 'SCORE') {
            const appliedScore = this.store().currentQuestion?.sectionCorrectScores?.find((s) => s.id === score.id)
            if (!appliedScore) {
                return
            }

            this._store.updateStore({
                currentQuestion: {
                    ...this.store().currentQuestion,
                    sectionCorrectScores: this.store().currentQuestion?.sectionCorrectScores?.map((s) => {
                        if (s.id === score.id) {
                            return { ...s, usage: subtract ? s.usage - 1 : s.usage + 1 }
                        }
                        return s
                    })
                }
            })
        } else if (score.mark_category === 'PENALTY') {
            const appliedScore = this.store().currentQuestion?.sectionPenaltyScores?.find((s) => s.id === score.id)
            if (!appliedScore) {
                return
            }

            this._store.updateStore({
                currentQuestion: {
                    ...this.store().currentQuestion,
                    sectionPenaltyScores: this.store().currentQuestion?.sectionPenaltyScores?.map((s) => {
                        if (s.id === score.id) {
                            return { ...s, usage: subtract ? s.usage - 1 : s.usage + 1 }
                        }
                        return s
                    })
                }
            })
        } else if (score.mark_category === 'VIOLATION') {
            const appliedScore = this.store().currentQuestion?.sectionViolationScores?.find((s) => s.id === score.id)
            if (!appliedScore) {
                return
            }

            this._store.updateStore({
                currentQuestion: {
                    ...this.store().currentQuestion,
                    sectionViolationScores: this.store().currentQuestion?.sectionViolationScores?.map((s) => {
                        if (s.id === score.id) {
                            return { ...s, usage: subtract ? s.usage - 1 : s.usage + 1 }
                        }
                        return s
                    })
                }
            })
        }
    }

    formatAndSaveMarkginGudeResponse(res: SchemePageData) {
        res.questions = res.questions.map(q => ({
            ...q,
            sections: q?.sections?.map(s => ({
                ...s,
                scores_correct: s?.scores_correct?.map(score => ({
                    ...score,
                    usage: 0
                })),
                scores_penalty: s?.scores_penalty?.map(score => ({
                    ...score,
                    usage: 0
                })),
                scores_violation: s?.scores_violation?.map(score => ({
                    ...score,
                    usage: 0
                }))
            }))
        }))

        this._store.updateStore({ markingGuide: res })
    }

    formAndSaveQuestions(res: ParticipantSectionTranscript[]) {
        const questions = res.map(q => {
            let jsonQuestionResponse;
            const pages: QuestionPage[] = []

            if (q.item_score.un_graded_response.length) {
                jsonQuestionResponse = JSON.parse(q.item_score.un_graded_response[0]) as DrawingStore

                jsonQuestionResponse.pages.forEach((p, index) => {
                    const page = new QuestionPage()
                    page.allowNavigation = index == 0 ? true : false
                    page.page = index
                    page.questionId = q.item.id

                    pages.push(page)
                })
            } else {
                const page = new QuestionPage()
                page.allowNavigation = true
                page.page = 0
                page.questionId = q.item.id

                pages.push(page)
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
                pages //todo: When saving, try to incorporate this values in the grading payload
            }
        })

        this._store.updateStore({ questions })
    }

    updateGradingSummary() {
        // Todo: calculate the question grade summary correctly
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
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.annotations.forEach(ann => {
            ann.identity.highlight = false
        })

        this._store.updateStore({ questions })
    }

    highlightAnnotation(annotation: QuestionAnnotation) {
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

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

        const ann = this.currentQuestion()?.question.annotations.find(ann => ann.identity.highlight)
        return ann
    })

    versionAnnotation() {
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

        if (!this.highlightedAnnotation()) {
            return
        }

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]
        question.annotations.forEach(ann => {
            if (ann.identity.highlight) {
                ann.identity.versioned = true
            }
        })

        this._toast.success('Annotation deleted successfully')
        this._store.updateStore({ questions })
        this.updateGradingSummary()
    }

    currentPageIsBlank = computed(() => {
        const page = this.store().questions[this.currentQuestionIndex()].pages.find((page) => page.page === this.currentPage())
        return page?.blank
    })

    markPageAsBlank() {
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

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
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
        this.sectionIndexChangeHandler()
        this.allowPageNavigation()
    }

    unMarkPageAsBlank() {
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

        const questions = this.store().questions
        const question = questions[this.currentQuestionIndex()]

        question.pages.forEach(p => {
            if (p.page == this.currentPage()) {
                p.blank = false
            }
        })

        this._store.updateStore({ questions })

        this._toast.success('Page unmarked as blank', { position: 'bottom-center' })
        this.updateGradingSummary()
        this.updateQuestionGradingStatus()
    }

    undoLastScore() {
        const currentQuestion = this.store().currentQuestion
        if (!currentQuestion) {
            return
        }

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

        let score;
        if (itemToRemove.mark_category == this.markTypes().SCORE) {
            score = this.currentQuestion()?.sectionCorrectScores.find(s => s.id == itemToRemove.score_id)
        } else if (itemToRemove.mark_category == this.markTypes().PENALTY) {
            score = this.currentQuestion()?.sectionPenaltyScores.find(s => s.id == itemToRemove.score_id)
        } else if (itemToRemove.mark_category == this.markTypes().VIOLATION) {
            score = this.currentQuestion()?.sectionViolationScores.find(s => s.id == itemToRemove.score_id)
        }

        if (!score) {
            return
        }

        this.updateScoreUsage(score, true)
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
}   