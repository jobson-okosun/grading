import { SchemePageData, ParticipantSectionTranscript, Participant_Result_Data_DTO, SchemeQuestionsTransformed, SchemeQuestionSectionScoreScoreDB } from "../../model/types"

export class StoreDTO {
    markingGuide: SchemePageData
    questions: ParticipantSectionTranscript[]
    candidate: Participant_Result_Data_DTO
    currentQuestionIndex: number
    currentQuestion?: {
        question: ParticipantSectionTranscript
        gradingGuide: SchemeQuestionsTransformed
        sectionCorrectScores: SchemeQuestionSectionScoreScoreDB[]
        sectionPenaltyScores: SchemeQuestionSectionScoreScoreDB[]
        sectionViolationScores: SchemeQuestionSectionScoreScoreDB[]
    }
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