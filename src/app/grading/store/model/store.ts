import { SchemePageData, ParticipantSectionTranscript, Participant_Result_Data_DTO, UserProxyRequest, SessionStateMessage } from "../../model/types"

export class StoreDTO {
    gradingInfo: UserProxyRequest
    session: SessionStateMessage
    markingGuide: SchemePageData
    questions: ParticipantSectionTranscript[]
    candidate: Participant_Result_Data_DTO
    currentQuestionIndex: number
    questionCurrentSectionIndex: number
    canvas: {
        type: 'DEFAULT' | 'OVERLAY'
        selectedMeasuringToolsSet: Set<string>
        onLoadWidth: number
        onLoadHeight: number,
        maxCanvasWindow: number
    }

    constructor() {
        this.currentQuestionIndex = 0
        this.questionCurrentSectionIndex = 0
        this.questions = []
        this.canvas = {
            type: 'DEFAULT',
            selectedMeasuringToolsSet: new Set(),
            onLoadWidth: 0,
            onLoadHeight: 0,
            maxCanvasWindow: 1500
        }
    }
}