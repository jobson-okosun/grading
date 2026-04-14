import { HttpClient } from "@angular/common/http";
import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { DataServiceTempStore, ExaminerGradeSeedDTO, Grading, Participant_Result_Data_DTO, ParticipantSectionTranscript, RejectSeedByExaminerDTO, ResourceCreated, ResourceModified, SchemePageData, SchemeSectionsResponseDTO, SeedParticipantSectionTranscript, SessionState, SessionStateMessage, UserProxyRequest } from "../model/types";
import { environment } from "../../../environments/environment";
import { finalize, lastValueFrom, Observable, tap } from "rxjs";
import { MOCK_MARKING_GUIDE } from "../model/mock/marking-guide";
import { MOCK_QUESTIONS } from "../model/mock/questions";
import { MOCK_RESULT } from "../model/mock/result";
import { Store } from "../store/store";
import { GradingService } from "./grading.service";
import { HotToastService } from "@ngxpert/hot-toast";

@Injectable({ providedIn: 'root' })
export class DataService {
    private _http = inject(HttpClient)
    private _store = inject(Store)
    private _gradingService = inject(GradingService)
    private _toast = inject(HotToastService)

    store = computed(() => this._store.store())
    tempStore = signal<DataServiceTempStore>(new DataServiceTempStore())

    assessmentId = computed(() => this.tempStore().gradingInfo?.data.assessment_id)
    sectionId = computed(() => this.tempStore().gradingInfo?.data.section_id)
    schemeId = computed(() => this.tempStore().schemeId)
    participantId = signal<string>('')

    sessionId = signal<string>('')
    subjectId = signal<string>('')
    userId = signal<string>('')

    isLoadingGuide = signal(false)
    isLoadingQuestions = signal(false)

    async fetchAllGradingData() {
        try {
            await lastValueFrom(this.fetchMarkingGuide())
            await lastValueFrom(this.fetchQuestionsToGrade())
            await lastValueFrom(this.fetchCandidateResult())
        } catch (error) {
            this._toast.error('Failed load grading data', { position: 'top-right' })
        }
    }

    login(): Observable<any> {
        return this._http.post<any>(`${environment.developmentIP2}/proxy/remote/login/${this.userId()}`, {})
    }

    fetchSchemeId(): Observable<SchemeSectionsResponseDTO> {
        return this._http.get<SchemeSectionsResponseDTO>(`${environment.developmentIP}/sch_mon_grd/reports/marker_app_ui/assessment/${this.assessmentId()}/fetch_subject_schemes`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        schemeId: response.scheme_id
                    }))
                })
            )
    }

    fetchGradingInformation(): Observable<UserProxyRequest> {
        return this._http.get<UserProxyRequest>(`${environment.developmentIP2}/proxy/user-marking-info/user/${this.userId()}/session/${this.sessionId()}/subject/${this.subjectId()}`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        gradingInfo: response
                    }))
                })
            )
    }

    fetchSessionState(): Observable<SessionStateMessage> {
        return this._http.get<SessionStateMessage>(`${environment.developmentIP2}/sessions/${this.sessionId()}/state`)
            .pipe(
                tap((response) => {
                    this.tempStore.update(v => ({
                        ...v,
                        session: response
                    }))

                    this._gradingService.isGradingSeed.set((response.data.state == SessionState.Seed) ? true : false)
                })
            )
    }

    fetchMarkingGuide(): Observable<SchemePageData> {
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

    fetchSeedToGrade(save: boolean): Observable<SeedParticipantSectionTranscript> {
        return this._http.get<SeedParticipantSectionTranscript>(`${environment.developmentIP}/sch_mon_grd/reports/marker_app_ui/seed/fetch_seed_to_grade/assessment/${this.assessmentId()}/section/${this.sectionId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    if (save) {
                        this.tempStore.update(v => ({
                            ...v,
                            seedQuestionsResponse: response,
                        }))
                    }
                }),
                finalize(() => this.isLoadingQuestions.set(false))
            )
    }

    rejectSeedScript(payload: RejectSeedByExaminerDTO): Observable<ResourceModified> {
        return this._http.post<ResourceModified>(`${environment.developmentIP}/sch_mon_grd/reports/marker_app_ui/seed/reject`, payload)
    }

    finishSeedGrading(payload: ExaminerGradeSeedDTO): Observable<ResourceCreated> {
        return this._http.post<ResourceCreated>(`${environment.developmentIP}/sch_mon_grd/reports/marker_app_ui/seed/grade`, payload)
    }

    fetchQuestionsToGrade(save?: boolean): Observable<SeedParticipantSectionTranscript | ParticipantSectionTranscript[]> {
        if (this._gradingService.isGradingSeed()) {
            return this.fetchSeedToGrade(save ? true : false)
        } else {
            return this.fetchQuestions(save ? true : false)
        }
    }

    fetchQuestions(save: boolean): Observable<ParticipantSectionTranscript[]> {
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

    reloadGradingServiceDataEffect = effect(() => {
        if (this._gradingService.gradingStarted()) {
            untracked(() => {
                this.fetchAllGradingData()
            })
        }
    })

    hasCompleteStoreData = effect(() => {
        const data = this.tempStore()

        return untracked(() => {
            if (
                data?.markingGuide &&
                data.session &&
                data.gradingInfo &&
                data.schemeId &&
                (data.seedQuestionsResponse)
            ) {
                const markingGuide = this._gradingService.formatAndSaveMarkginGudeResponse(data.markingGuide)

                //todo: handle for normal scripts
                const questions = this._gradingService.formatAndSaveQuestions(data.seedQuestionsResponse.scripts)

                this._store.updateStore({
                    markingGuide,
                    questions,
                    candidate: data.candidate,
                    gradingInfo: data.gradingInfo,
                    session: data.session
                })
            }
        })
    })

    useMockData() {
        this.tempStore.update(v => ({
            ...v,
            markingGuide: MOCK_MARKING_GUIDE,
            seedQuestionsResponse: {
                scripts: MOCK_QUESTIONS,
                lock: 0,
                psr_id: 0
            },
            candidate: MOCK_RESULT,
            gradingInfo: {
                message: 'Success',
                data: {
                    subject_id: '1',
                    section_id: '1',
                    examiner_id: '1',
                    assessment_id: '1',
                    session_id: '1',
                },
                session: {
                    message: 'Session is locked',
                    data: {
                        session_id: '1',
                        state: SessionState.Seed
                    }
                }
            }
        }))
    }

}