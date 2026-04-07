import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Participant_Result_Data_DTO, ParticipantSectionTranscript, SchemePageData } from "../model/types";
import { environment } from "../../../environments/environment";
import { Observable, tap } from "rxjs";
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

    assessmentId = signal<null | string>(null)
    sectionId = signal<null | string>(null)
    participantId = signal<null | string>(null)
    schemeId = signal<null | string>(null)


    fetchMarkingGuide(): Observable<SchemePageData> {
        this._gradingService.formatAndSaveMarkginGudeResponse(MOCK_MARKING_GUIDE)

        return this._http.get<SchemePageData>(`${environment.developmentIP}/sch_mon_grd/schedule/assessment/${this.assessmentId()}/marking_scheme/section/${this.sectionId()}/scheme_id/${this.schemeId()}/fetch_scheme_page`)
            .pipe(
                tap((response) => {
                    this._gradingService.formatAndSaveMarkginGudeResponse(response)
                })
            )
    }

    fetchQuestions(): Observable<ParticipantSectionTranscript[]> {
        this._gradingService.formAndSaveQuestions(MOCK_QUESTIONS)

        return this._http.get<ParticipantSectionTranscript[]>(`${environment.developmentIP}/sch_mon_grd/reports/grading/items_to_grade/assessment/${this.assessmentId()}/section/${this.sectionId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    this._gradingService.formAndSaveQuestions(response)
                })
            )
    }

    fetchCandidateResult(): Observable<Participant_Result_Data_DTO> {
        this._store.updateStore({ candidate: MOCK_RESULT })

        return this._http.get<Participant_Result_Data_DTO>(`${environment.developmentIP}/sch_mon_grd/reports/result/participant_result/assessment/${this.assessmentId()}/participant/${this.participantId()}`)
            .pipe(
                tap((response) => {
                    this._store.updateStore({ candidate: response })
                })
            )
    }
}