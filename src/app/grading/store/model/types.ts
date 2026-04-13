import { SchemeQuestionSectionScoreScoreDB, SchemeQuestionSectionsTransformed } from "../../model/types"

export class GradeSummary {
    correct: number
    penalty: number
    violation: number
    score: number

    constructor() {
        this.correct = 0
        this.penalty = 0
        this.violation = 0
        this.score = 0
    }
}

export class AnnotationIdentity {
    questionId: string
    sectionId: string
    scoreId: string
    scoreUsage: number
    scoreMaxOccurence: number
    id: string
    versioned: boolean
    applied: boolean
    highlight: boolean
    shape: AnnotationShape
}

export enum AnnotationShape {
    RING = 'RING',
    UNDERLINE = 'UNDERLINE',
    X = 'X',
    NONE = 'NONE',
    CHECK = 'CHECK',
    BAN = 'BAN'
}

export class AnnotationToApply {
    position: string[]
    gradeScore: number
    section: SchemeQuestionSectionsTransformed | null
    score: SchemeQuestionSectionScoreScoreDB | null
    applied: boolean
    shape: AnnotationScoreShape

    constructor() {
        this.section = null
        this.score = null
        this.applied = false
        this.position = []
        this.gradeScore = 0
    }
}

export class AnnotationScoreShape {
    correct: AnnotationShape | undefined
    penalty: AnnotationShape | undefined
    violation: AnnotationShape | undefined
}