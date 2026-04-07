import { SchemePageData } from "../types";

export const MOCK_MARKING_GUIDE = {
    "scheme_id": "scheme_001",
    "general_marking_guide": "Follow all marking rules strictly.",
    "section_id": "section_001",
    "published": true,
    "scheme_question_row_id": "row_001",

    "correct_mark_types": [
        {
            "id": "mt_001",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "name": "Accuracy",
            "description": "Marks for correct answers",
            "code": "ACC"
        },
        {
            "id": "mt_002",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "name": "Completeness",
            "description": "Marks for complete answers",
            "code": "COM"
        },
        {
            "id": "mt_003",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "name": "Clarity",
            "description": "Marks for clear explanation",
            "code": "CLR"
        }
    ],

    "penalty_mark_types": [
        {
            "id": "mt_004",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "name": "Wrong Step",
            "description": "Penalty for incorrect steps",
            "code": "WRS"
        },
        {
            "id": "mt_005",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "name": "Omission",
            "description": "Penalty for missing steps",
            "code": "OMS"
        },
        {
            "id": "mt_006",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "name": "Calculation Error",
            "description": "Penalty for calculation mistakes",
            "code": "CAL"
        }
    ],

    "violation_mark_types": [
        {
            "id": "mt_007",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "name": "Plagiarism",
            "description": "Copied work",
            "code": "PLG"
        },
        {
            "id": "mt_008",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "name": "Misconduct",
            "description": "Exam misconduct",
            "code": "MSC"
        },
        {
            "id": "mt_009",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "name": "Late Submission",
            "description": "Submitted after deadline",
            "code": "LTS"
        }
    ],

    "general_scores_correct": [
        {
            "id": "gs_001",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "mark_type_id": "mt_001",
            "name": "Full Marks",
            "description": "Perfect answer",
            "code": "FM",
            "max_score": 10,
            "marker_discretion": false,
            "max_occurrence": 1,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_002",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "mark_type_id": "mt_002",
            "name": "Partial Marks",
            "description": "Partially correct",
            "code": "PM",
            "max_score": 5,
            "marker_discretion": true,
            "max_occurrence": 2,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_003",
            "scheme_id": "scheme_001",
            "mark_category": "SCORE",
            "mark_type_id": "mt_003",
            "name": "Bonus",
            "description": "Extra clarity",
            "code": "BNS",
            "max_score": 2,
            "marker_discretion": true,
            "max_occurrence": 1,
            "boundary": "GENERAL"
        }
    ],

    "general_scores_penalty": [
        {
            "id": "gs_004",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "mark_type_id": "mt_004",
            "name": "Step Error",
            "description": "Wrong step deduction",
            "code": "SE",
            "max_score": -2,
            "marker_discretion": false,
            "max_occurrence": 3,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_005",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "mark_type_id": "mt_005",
            "name": "Missing Step",
            "description": "Omitted step deduction",
            "code": "MS",
            "max_score": -3,
            "marker_discretion": false,
            "max_occurrence": 2,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_006",
            "scheme_id": "scheme_001",
            "mark_category": "PENALTY",
            "mark_type_id": "mt_006",
            "name": "Math Error",
            "description": "Calculation mistake deduction",
            "code": "ME",
            "max_score": -1,
            "marker_discretion": true,
            "max_occurrence": 3,
            "boundary": "GENERAL"
        }
    ],

    "general_scores_violation": [
        {
            "id": "gs_007",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "mark_type_id": "mt_007",
            "name": "Plagiarism Penalty",
            "description": "Copied content",
            "code": "PP",
            "max_score": -10,
            "marker_discretion": false,
            "max_occurrence": 1,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_008",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "mark_type_id": "mt_008",
            "name": "Misconduct Penalty",
            "description": "Exam violation",
            "code": "MP",
            "max_score": -20,
            "marker_discretion": false,
            "max_occurrence": 1,
            "boundary": "GENERAL"
        },
        {
            "id": "gs_009",
            "scheme_id": "scheme_001",
            "mark_category": "VIOLATION",
            "mark_type_id": "mt_009",
            "name": "Late Penalty",
            "description": "Late submission",
            "code": "LP",
            "max_score": -5,
            "marker_discretion": true,
            "max_occurrence": 1,
            "boundary": "GENERAL"
        }
    ],

    "questions": [
        {
            "id": "q_001",
            "block_id": 1,
            "item_id": "item_001",
            "score": 20,
            "question": "Explain gravity.",
            "marking_guide": "Mention force and mass.",
            "passage_question": "",
            "item_type": "ESSAY",
            "has_passage": false,
            "sections": [
                {
                    "id": "sec_001",
                    "name": "A",
                    "marking_guide": "Define gravity correctly.",
                    "total_score": 10,
                    "total_deductions": 2,
                    "item_id": "item_001",
                    "scores_correct": [
                        {
                            "id": "sqs_001",
                            "scheme_id": "scheme_001",
                            "mark_category": "SCORE",
                            "mark_type_id": "mt_001",
                            "name": "Correct Definition",
                            "description": "Accurate definition",
                            "code": "CD",
                            "max_score": 5,
                            "marker_discretion": false,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        },
                        {
                            "id": "sqs_002",
                            "scheme_id": "scheme_001",
                            "mark_category": "SCORE",
                            "mark_type_id": "mt_002",
                            "name": "Partial Definition",
                            "description": "Incomplete definition",
                            "code": "PD",
                            "max_score": 3,
                            "marker_discretion": false,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        },
                        {
                            "id": "sqs_003",
                            "scheme_id": "scheme_001",
                            "mark_category": "SCORE",
                            "mark_type_id": "mt_003",
                            "name": "Extra Info",
                            "description": "Additional explanation",
                            "code": "EI",
                            "max_score": 2,
                            "marker_discretion": true,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ],
                    "scores_penalty": [
                        {
                            "id": "sqs_001",
                            "scheme_id": "scheme_001",
                            "mark_category": "PENALTY",
                            "mark_type_id": "mt_001",
                            "name": "Penalty Definition",
                            "description": "Accurate definition",
                            "code": "PD",
                            "max_score": 2,
                            "marker_discretion": true,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        },
                        {
                            "id": "sqs_002",
                            "scheme_id": "scheme_001",
                            "mark_category": "PENALTY",
                            "mark_type_id": "mt_001",
                            "name": "Penalty Definition",
                            "description": "Accurate definition",
                            "code": "PD",
                            "max_score": 2,
                            "marker_discretion": false,
                            "boundary": "SECTION",
                            "max_occurrence": 3,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ],
                    "scores_violation": [
                        {
                            "id": "sqs_001",
                            "scheme_id": "scheme_001",
                            "mark_category": "VIOLATION",
                            "mark_type_id": "mt_001",
                            "name": "Violation Definition",
                            "description": "Accurate definition",
                            "code": "PD",
                            "max_score": 2,
                            "marker_discretion": true,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "item_001",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ]
                },
                {
                    "id": "sec_002",
                    "name": "B",
                    "marking_guide": "Provide examples.",
                    "total_score": 5,
                    "total_deductions": 1,
                    "item_id": "item_001",
                    "scores_correct": [],
                    "scores_penalty": [],
                    "scores_violation": []
                },
                {
                    "id": "sec_003",
                    "name": "C",
                    "marking_guide": "Explain usage.",
                    "total_score": 5,
                    "total_deductions": 1,
                    "item_id": "item_001",
                    "scores_correct": [],
                    "scores_penalty": [],
                    "scores_violation": []
                }
            ]
        },

        {
            "id": "q_002",
            "block_id": 2,
            "item_id": "item_002",
            "score": 10,
            "question": "Define photosynthesis.",
            "marking_guide": "Include sunlight and chlorophyll.",
            "passage_question": "",
            "item_type": "ESSAY",
            "has_passage": false,
            "sections": [
                {
                    "id": "sec_001",
                    "name": "A",
                    "marking_guide": "Define gravity correctly.",
                    "total_score": 10,
                    "total_deductions": 2,
                    "item_id": "q_002",
                    "scores_correct": [
                        {
                            "id": "sqs_003",
                            "scheme_id": "scheme_001",
                            "mark_category": "SCORE",
                            "mark_type_id": "mt_003",
                            "name": "Extra Info",
                            "description": "Additional explanation",
                            "code": "EI",
                            "max_score": 10,
                            "marker_discretion": true,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "q_002",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ],
                    "scores_penalty": [
                        {
                            "id": "sqs_002",
                            "scheme_id": "scheme_001",
                            "mark_category": "PENALTY",
                            "mark_type_id": "mt_001",
                            "name": "Penalty Definition",
                            "description": "Accurate definition",
                            "code": "PD",
                            "max_score": 5,
                            "marker_discretion": false,
                            "boundary": "SECTION",
                            "max_occurrence": 3,
                            "item_id": "q_002",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ],
                    "scores_violation": [
                        {
                            "id": "sqs_001",
                            "scheme_id": "scheme_001",
                            "mark_category": "VIOLATION",
                            "mark_type_id": "mt_001",
                            "name": "Violation Definition",
                            "description": "Accurate definition",
                            "code": "PD",
                            "max_score": 2,
                            "marker_discretion": false,
                            "boundary": "SECTION",
                            "max_occurrence": 1,
                            "item_id": "q_002",
                            "question_section_id": "sec_001",
                            "scheme_question_row_id": "row_001"
                        }
                    ]
                }
            ],
            "passage_id": "pass_001"
        },

        {
            "id": "q_003",
            "block_id": 3,
            "item_id": "item_003",
            "score": 10,
            "question": "What is velocity?",
            "marking_guide": "Speed with direction.",
            "passage_question": "",
            "item_type": "SHORT_ANSWER",
            "has_passage": false,
            "sections": []
        }
    ]
} as any as SchemePageData;
