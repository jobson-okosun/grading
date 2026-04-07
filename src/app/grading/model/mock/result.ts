export const MOCK_RESULT = {
    "participants_id": "part_001",
    "assessment_id": "assess_001",
    "group_name": "Group A",
    "center_id": "center_001",

    "section_attempts": {
        "sections": [
            {
                "id": "sec_001",
                "name": "Mathematics",
                "total_attempted": 20
            },
            {
                "id": "sec_002",
                "name": "English",
                "total_attempted": 18
            },
            {
                "id": "sec_003",
                "name": "Physics",
                "total_attempted": 15
            }
        ],
        "total_attempted": 53
    },

    "batch_name": "Batch 2026",
    "suspended": false,

    "logins_ips": {
        "initial_login": "2026-03-01T08:00:00Z",
        "duration": 7200,
        "end_time": "2026-03-01T10:00:00Z",
        "other_logins": [
            "2026-03-01T08:30:00Z",
            "2026-03-01T09:00:00Z",
            "2026-03-01T09:30:00Z"
        ],
        "ip_addresses": [
            {
                "ip_address": "192.168.1.1",
                "time": "2026-03-01T08:00:00Z"
            },
            {
                "ip_address": "192.168.1.2",
                "time": "2026-03-01T08:30:00Z"
            },
            {
                "ip_address": "192.168.1.3",
                "time": "2026-03-01T09:00:00Z"
            }
        ]
    },

    "status": "COMPLETED",
    "timed_out": false,
    "comp_time_added": false,
    "computer_swapped": false,
    "re_login": true,

    "score": {
        "score": 75,
        "scaled_score": 82,
        "total_items": 60,
        "section_scores": [
            {
                "section_name": "Mathematics",
                "section_id": "sec_001",
                "score": 30,
                "scaled_score": 35,
                "total_items": 20
            },
            {
                "section_name": "English",
                "section_id": "sec_002",
                "score": 25,
                "scaled_score": 27,
                "total_items": 20
            },
            {
                "section_name": "Physics",
                "section_id": "sec_003",
                "score": 20,
                "scaled_score": 20,
                "total_items": 20
            }
        ]
    },

    "reg_fields": {
        "first_name": "John",
        "last_name": "Doe",
        "registration_number": "REG123456"
    },

    "registered_on": "2026-02-20T10:00:00Z",
    "exam_name": "Mock Examination 2026",
    "delivery_method": "CBT",
    "start_date": "2026-03-01T08:00:00Z",
    "end_date": "2026-03-01T10:00:00Z",
    "average_scaled_score": 78.5,
    "percentile": 85.2,

    "attempt_summary": [
        {
            "section_id": "sec_001",
            "section_name": "Mathematics",
            "total_section_items": 20,
            "section_scaled_score": 35,
            "section_raw_score": 30,
            "total_section_marks_obtainable": 40,
            "total_correct_items": 15,
            "total_correct_items_mark": 30,
            "total_incorrect_items": 3,
            "total_incorrect_items_mark": -3,
            "total_partially_correct_items": 2,
            "total_partial_correct_items_mark": 3,
            "total_not_attempted_items": 0,
            "total_not_attempted_items_mark": 0,
            "total_manual_graded_items_mark": 5,
            "total_manual_graded_items": 2,
            "total_penalty_mark_lost": 3
        },
        {
            "section_id": "sec_002",
            "section_name": "English",
            "total_section_items": 20,
            "section_scaled_score": 27,
            "section_raw_score": 25,
            "total_section_marks_obtainable": 40,
            "total_correct_items": 12,
            "total_correct_items_mark": 25,
            "total_incorrect_items": 5,
            "total_incorrect_items_mark": -5,
            "total_partially_correct_items": 3,
            "total_partial_correct_items_mark": 5,
            "total_not_attempted_items": 0,
            "total_not_attempted_items_mark": 0,
            "total_manual_graded_items_mark": 3,
            "total_manual_graded_items": 1,
            "total_penalty_mark_lost": 5
        },
        {
            "section_id": "sec_003",
            "section_name": "Physics",
            "total_section_items": 20,
            "section_scaled_score": 20,
            "section_raw_score": 20,
            "total_section_marks_obtainable": 40,
            "total_correct_items": 10,
            "total_correct_items_mark": 20,
            "total_incorrect_items": 5,
            "total_incorrect_items_mark": -5,
            "total_partially_correct_items": 2,
            "total_partial_correct_items_mark": 3,
            "total_not_attempted_items": 3,
            "total_not_attempted_items_mark": 0,
            "total_manual_graded_items_mark": 2,
            "total_manual_graded_items": 1,
            "total_penalty_mark_lost": 5
        }
    ],

    "login_field": "registration_number"
}