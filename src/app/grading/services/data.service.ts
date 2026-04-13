import { HttpClient } from "@angular/common/http";
import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { Grading, gradingInformation, Participant_Result_Data_DTO, ParticipantSectionTranscript, ResourceCreated, SchemePageData, SeedParticipantSectionTranscript } from "../model/types";
import { environment } from "../../../environments/environment";
import { finalize, Observable, tap } from "rxjs";
import { MOCK_MARKING_GUIDE } from "../model/mock/marking-guide";
import { MOCK_QUESTIONS } from "../model/mock/questions";
import { MOCK_RESULT } from "../model/mock/result";
import { Store } from "../store/store";
import { GradingService } from "./grading.service";

@Injectable({ providedIn: 'root' })
export class DataService {
    private _http = inject(HttpClient)
    private _store = inject(Store)
    private _gradingService = inject(GradingService)

    store = computed(() => this._store.store())
    assessmentId = computed(() => this.store().gradingInfo?.assessment_id)
    sectionId = computed(() => this.store().gradingInfo?.section_id)
    participantId = signal<null | string>(null)
    schemeId = computed(() => this.store().gradingInfo?.scheme_id)

    isLoadingGuide = signal(false)
    isLoadingQuestions = signal(false)

    reloadGradingServiceDataEffect = effect(() => {
        if (this._gradingService.gradingStarted()) {
            untracked(() => {
                this.fetchAllGradingData()
            })
        }
    })

    tempStore = signal<{ markingGuide: any, questions: any[], candidate: any }>({
        markingGuide: null,
        questions: [],
        candidate: null
    })

    hasCompleteStoreData = effect(() => {
        const data = this.tempStore()

        return untracked(() => {
            if (data?.markingGuide && data.questions && data.candidate) {
                const markingGuide = this._gradingService.formatAndSaveMarkginGudeResponse(data.markingGuide)
                const questions = this._gradingService.formatAndSaveQuestions(data.questions)

                this._store.updateStore({
                    markingGuide,
                    questions,
                    candidate: data.candidate
                })
            }
        })
    })

    async fetchAllGradingData() {
        this.fetchMarkingGuide().subscribe()
        this.fetchQuestionsToGrade().subscribe()
        this.fetchCandidateResult().subscribe()
    }

    fetchGradingInformation(): Observable<gradingInformation> {
        const info = {
            isSeed: true,
            assessment_id: 1,
            section_id: 1,
            scheme_id: 1,
            subject_id: 1,
            examiner_id: 1,
            session_id: 1,
        }

        this._store.updateStore({ gradingInfo: info })

        return this._http.get<gradingInformation>(`${environment.developmentIP}/sch_mon_grd/reports/grading/info/assessment/${this.assessmentId()}`)
            .pipe(
                tap((response) => {
                    this._store.updateStore({ gradingInfo: response })
                })
            )
    }

    fetchMarkingGuide(): Observable<SchemePageData> {
        this.isLoadingGuide.set(true)

        this.tempStore.update(v => ({
            ...v,
            markingGuide: MOCK_MARKING_GUIDE,
        }))

        return this._http.get<SchemePageData>(`${environment.developmentIP}/sch_mon_grd/schedule/assessment/${this.assessmentId()}/marking_scheme/section/${this.sectionId()}/scheme_id/${this.schemeId()}/fetch_scheme_page`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        markingGuide: response,
                    }))
                }),
                finalize(() => this.isLoadingGuide.set(false))
            )
    }

    fetchQuestionsToGrade(save?: boolean): Observable<SeedParticipantSectionTranscript | ParticipantSectionTranscript[]> {
        if (this._gradingService.isGradingSeed()) {
            return this.fetchSeedToGrade(save ? true : false)
        } else {
            return this.fetchQuestions(save ? true : false)
        }
    }


    fetchSeedToGrade(save: boolean): Observable<SeedParticipantSectionTranscript> {
        this.isLoadingQuestions.set(true)

        this.tempStore.update(v => ({
            ...v,
            questions: MOCK_QUESTIONS,
        }))

        return this._http.get<SeedParticipantSectionTranscript>(`${environment.developmentIP}/sch_mon_grd/reports/marker_app_ui/seed/fetch_seed_to_grade/assessment/${this.assessmentId()}/section/${this.sectionId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    if (save) {
                        this.tempStore.update(v => ({
                            ...v,
                            questions: response.scripts,
                        }))
                    }
                }),
                finalize(() => this.isLoadingQuestions.set(false))
            )
    }


    fetchQuestions(save: boolean): Observable<ParticipantSectionTranscript[]> {
        this.tempStore.update(v => ({
            ...v,
            questions: MOCK_QUESTIONS,
        }))

        return this._http.get<ParticipantSectionTranscript[]>(`${environment.developmentIP}/sch_mon_grd/reports/grading/items_to_grade/assessment/${this.assessmentId()}/section/${this.sectionId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        questions: response,
                    }))
                })
            )
    }

    fetchCandidateResult(): Observable<Participant_Result_Data_DTO> {
        this.tempStore.update(v => ({
            ...v,
            candidate: MOCK_RESULT,
        }))

        return this._http.get<Participant_Result_Data_DTO>(`${environment.developmentIP}/sch_mon_grd/reports/result/participant_result/assessment/${this.assessmentId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        candidate: response,
                    }))
                })
            )
    }

    finishGrading(payload: Grading[]): Observable<ResourceCreated> {
        return this._http.post<ResourceCreated>(`${environment.developmentIP}/sch_mon_grd/reports/grading/grade_manual_items/assessment/${this.assessmentId()}/section/${this.sectionId()}/participant/${this.participantId()}`, payload)
    }
}