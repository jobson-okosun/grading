import { AnnotationIdentity } from "../store/model/types";

export interface SchemeSectionsResponseDTO {
  id: string;
  name: String;
  scheme_id: string;
}

export interface NewSectionSchemeDTO {
  section_id: string;
}

export enum SchemeMarkCategory {
  SCORE = 'SCORE',
  PENALTY = 'PENALTY',
  VIOLATION = 'VIOLATION',
}

export enum SchemeScoreBoundary {
  GENERAL = 'GENERAL',
  SECTION = 'SECTION',
}

export interface MarkTypeDBDTO {
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  name: string;
  description: string;
  code: string;
  id: string;
}

export interface SchemeQuestionsTransformed {
  id: string;
  block_id: number;
  item_id: string;
  passage_id?: string;
  score: number;
  question: string;
  marking_guide: string;
  passage_question: string;
  item_type: ItemType;
  has_passage: boolean;
  sections: SchemeQuestionSectionsTransformed[];
}

export interface SchemePageData {
  scheme_id: string;
  general_marking_guide: string;
  section_id: string;
  correct_mark_types: MarkTypeDBDTO[];
  penalty_mark_types: MarkTypeDBDTO[];
  violation_mark_types: MarkTypeDBDTO[];
  general_scores_correct: GeneralScoreDB[];
  general_scores_penalty: GeneralScoreDB[];
  general_scores_violation: GeneralScoreDB[];
  questions: SchemeQuestionsTransformed[];
  published: boolean;
  scheme_question_row_id: string;
}

export interface MarkTypeDTO {
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  name: string;
  description: string;
  code: string;
}

export interface MarkTypeDBDTO extends MarkTypeDTO {
  id: string;
}

export interface EditMarkTypeDTO extends MarkTypeDBDTO { }

export interface ResourceModified {
  id: string;
}

export interface markingGuideDTO {
  marking_guide: string;
  scheme_id: string;
}

export interface SchemeQuestionSectionScoreScoreDB {
  id: string;
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  mark_type_id: string;
  name: string;
  description: string;
  code: string;
  max_score: number;
  marker_discretion: boolean;
  boundary: SchemeScoreBoundary;
  max_occurrence: number;
  item_id: string;
  question_section_id: string;
  scheme_question_row_id: string;

  // Temp extension
  usage: number
}


export interface GeneralScoreDTO {
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  mark_type_id: string;
  name: string;
  description: string;
  code: string;
  max_score: number;
  marker_discretion: boolean;
  max_occurrence: number;
}

export interface GeneralScoreDB extends GeneralScoreDTO {
  id: string;
  boundary: SchemeScoreBoundary;

  // Temp extension
  usage: number
}

export interface SelectSchemeQuestionToAdd {
  block_id: number;
  item_id: string;
  passage_id?: string;
  question: string;
  passage_question: string;
  showPassage?: boolean;
  item_type: ItemType;
  has_passage: boolean;
}

export interface NewSchemeQuestionDTO {
  block_id: number;
  item_id: string;
  passage_id?: string;
  scheme_question_row_id: string;
}

export interface SchemeQuestion {
  id: string;
  block_id: number;
  item_id: string;
  passage_id?: string;
  score: number;
  question: string;
  marking_guide: string;
  passage_question: string;
  item_type: ItemType;
  has_passage: boolean;
}

export interface AddEditSchemeQuestionMarkingGuideDTO {
  item_id: string;
  marking_guide: string;
  scheme_question_row_id: string;
}

export interface NewSchemeQuestionSectionDTO {
  name: string;
  marking_guide: string;
  total_score: number;
  total_deductions: number;
  item_id: string;
  scheme_question_row_id: string;
}

export interface SchemeQuestionSections {
  name: string;
  marking_guide: string;
  id: string;
  total_score: number;
  total_deductions: number;
  item_id: string;
}

export interface SchemeQuestionSectionScoreDTO {
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  mark_type_id: string;
  name: string;
  description: string;
  code: string;
  max_score: number;
  marker_discretion: boolean;
  max_occurrence: number;
  item_id: string;
  question_section_id: string;
  scheme_question_row_id: string;
}

export interface SchemeQuestionSectionScoreDB extends SchemeQuestionSectionScoreDTO {
  id: string;
  boundary: SchemeScoreBoundary;
}

export interface EditSchemeQuestionSectionScoreDB {
  id: string;
  scheme_id: string;
  mark_category: SchemeMarkCategory;
  mark_type_id: string;
  name: string;
  description: string;
  code: string;
  max_score: number;
  marker_discretion: boolean;
  boundary: SchemeScoreBoundary;
  max_occurrence: number;
  item_id: string;
  question_section_id: string;
  scheme_question_row_id: string;
}

export interface SchemeQuestionSectionsTransformed {
  name: string;
  marking_guide: string;
  id: string;
  total_score: number;
  total_deductions: number;
  item_id: string;
  scores_correct: SchemeQuestionSectionScoreScoreDB[];
  scores_penalty: SchemeQuestionSectionScoreScoreDB[];
  scores_violation: SchemeQuestionSectionScoreScoreDB[];

  // Temp extension
  not_attempted: boolean
}

export enum ItemType {
  MCQ = 'MCQ',
  MRQ = 'MRQ',
  ESSAY_RICH_TEXT = 'ESSAY_RICH_TEXT',
  CLOZE_TEXT = 'CLOZE_TEXT',
  CLOZE_DROPDOWN = 'CLOZE_DROPDOWN',
  SHORT_TEXT = 'SHORT_TEXT',
  TRUE_FALSE = 'TRUE_FALSE',
  YES_NO = 'YES_NO',
  ASSOCIATION = 'ASSOCIATION',
  CHOICE_MATRIX = 'CHOICE_MATRIX',
  ORDER_LIST = 'ORDER_LIST',
  CLOZE_TEXT_IMAGE = 'CLOZE_TEXT_IMAGE',
  CLOZE_DROPDOWN_IMAGE = 'CLOZE_DROPDOWN_IMAGE',
  IMAGE_DRAG_AND_DROP = 'IMAGE_DRAG_AND_DROP',
  DRAWING_AND_WRITING = 'DRAWING_AND_WRITING'
}

export interface UserProxyRequest {
  message: string
  data: {
    subject_id: string,
    section_id: string,
    examiner_id: string,
    assessment_id: string,
    session_id: string,
  }
}


export interface SeedParticipantSectionTranscript {
  scripts: ParticipantSectionTranscript[];
  lock: number;
  psr_id: number;
}

export interface SessionStateMessage {
  message: string;
  data: SessionStateDto;
}

export interface SessionStateDto {
  session_id: string;
  state: SessionState;
}

export enum SessionState {
  Script = "Script",
  Seed = "Seed",
  Vetting = "Vetting",
  None = "None",
}


export interface ParticipantSectionTranscript {
  item_score: CandidateItemScore;
  item: questionItem;

  // Temp extension
  annotations: QuestionAnnotation[]
  gradingStatus: GradingStatus
  pages: QuestionPage[]
}

export class QuestionPage {
  questionId: string
  page: number
  allowNavigation: boolean
  blank: boolean
}

export interface GradingStatus {
  visited: boolean;
  notVisited: boolean;
  graded: boolean
  blanks: number;
}

export class CandidateItemScore {
  item_id: string;
  score: number;
  graded: boolean;
  un_graded_response: string[];
  graded_response: string[];
  blkId: number;
  revisit_later: boolean;
  passage_id: string | null;
  item_type: ItemType;
  pass_fail_status: PassFailStatus;
  penalty: number;
  has_penalty: boolean;
  subject_id: string;
  topic_id: string;
  topic_iame: string;
  subtopic_id: string | null;
  subtopic_name: string | null;
  manual_grade_remark: string;
  annotations: QuestionAnnotation[]
}

export class QuestionAnnotation {
  position: string[];
  page: number;
  code: string;
  score: number;
  markers_discretion: boolean;
  comment: string;
  score_id: string;
  mark_category: SchemeMarkCategory.SCORE | SchemeMarkCategory.PENALTY | SchemeMarkCategory.VIOLATION;;
  mark_type_id: string;
  name: string;
  boundary: SchemeScoreBoundary;
  question_section_id: string;
  item_id: string;
  identity: AnnotationIdentity
}

export class Grading {
  item_id: string;
  remark: string;
  score: number;
  include_penalty: boolean;
  annotations: QuestionAnnotation[]
}

export interface ExaminerGradeSeedDTO {
  assessment_id: string
  participant_id: string
  section_id: string
  item_ids_score: ManualGradeDTO[]
  session_id: string
  subject_id: string
  lock_id: number
  psr_id: number
}

export interface ManualGradeDTO extends Grading {
}


export interface Totals {
  violations: number;
  score: number;
  penalty: number;
};

export interface SummaryResult {
  overall: Totals;
  perQuestion: Record<string, Totals>;
};

export enum PassFailStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  UNATTEMPTED = 'UNATTEMPTED',
  MANUAL_SCORING = 'MANUAL_SCORING',
  PARTIAL = 'PARTIAL',
}

export class questionItem {
  id: string;
  authorId: string;
  authorName: string;
  passageId: string;
  passageStimulus: string;
  stimulus: string;
  scoringOption: {
    score: number;
    penalty: number;
    minimumScoreIfAttempted: number;
    answers: string[];
    scoringType: string;
    autoScore: boolean;
    matchingRule: string;
    caseSensitive: boolean;
    ignoreLeadingAndTrailingSpaces: boolean;
  };
  options: Array<IOptionDTO>;
  stems: Array<string>;
  possibleResponses: Array<IPossibleResponse>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tags: Array<{
    tagId: string;
    tagName: string;
  }>;
  responsePositions: Array<IResponsePosition>;
  itemType: ItemType;
  numerical: boolean;
  caseSensitive: boolean;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  topicName: string;
  subtopicName: string;
  difficultyLevel: number;
  shuffleOptions: boolean;
  multipleResponse: boolean;
  maxWords: number;
  maxLength: number;
  allowPaste: boolean;
  allowCopy: boolean;
  allowCut: boolean;
  plainText: boolean;
  reference: string;
  pass_fail_status?: string;
  backgroundType?: string;
}

export interface IOptionDTO {
  label: string;
  value: string;
}

export interface IPossibleResponse {
  responses: Array<string>;
}
export interface IResponsePosition {
  x: number;
  y: number;
}

export class Participant_Result_Data_DTO {
  participants_id: string;
  assessment_id: string;
  group_name: string;
  center_id: string;
  section_attempts: SectionAttempts | null;
  batch_name: string | null;
  suspended: boolean;
  logins_ips: ParticipantLogins | null;
  status: string;
  timed_out: boolean;
  comp_time_added: boolean;
  computer_swapped: boolean;
  re_login: boolean;
  score: Participant_Score | null;
  reg_fields: Record<string, string>;
  registered_on: string;
  exam_name: string;
  delivery_method: string;
  start_date: string;
  end_date: string;
  average_scaled_score: number;
  percentile: number;
  attempt_summary: Section_Attempt_Summary[];
  login_field: string
}

export class SectionAttempts {
  sections: SectionAttempted[];
  total_attempted: number;
}

export class SectionAttempted {
  id: string;
  name: string;
  total_attempted: number;
}

export class ParticipantLogins {
  initial_login: string;
  duration: number;
  end_time: string;
  other_logins: string[];
  ip_addresses: ParticipantIpAddressAndTime[];
}

export class ParticipantIpAddressAndTime {
  ip_address: string;
  time: string;
}

export class Participant_Score {
  score: number;
  scaled_score: number;
  total_items: number;
  section_scores: Section_Score_Response[];
}

export class Section_Score_Response {
  section_name: string;
  section_id: string;
  score: number;
  scaled_score: number;
  total_items: number;
}

export class Section_Attempt_Summary {
  section_id: string;
  section_name: string;
  total_section_items: number;
  section_scaled_score: number;
  section_raw_score: number;
  total_section_marks_obtainable: number;
  total_correct_items: number;
  total_correct_items_mark: number;
  total_incorrect_items: number;
  total_incorrect_items_mark: number;
  total_partially_correct_items: number;
  total_partial_correct_items_mark: number;
  total_not_attempted_items: number;
  total_not_attempted_items_mark: number;
  total_manual_graded_items_mark: number;
  total_manual_graded_items: number;
  total_penalty_mark_lost: number;
}

export class ResourceCreated {
  id?: string;
}

export enum MarkType {
  Seed = "Seed",
  Script = "Script",
}

export interface RejectSeedByExaminerDTO {
  marker_id: string;
  session_id: string;
  subject_id: string;
  assessment_id: string;
  section_id: string;
  psr_id: number;
  participant_id: string;
  lock_id: number;
  mark_type: MarkType;
}

export class DataServiceTempStore {
  markingGuide: SchemePageData | null;
  seedQuestionsResponse: SeedParticipantSectionTranscript | null;
  questionResponse: ParticipantSectionTranscript | null;
  candidate: Participant_Result_Data_DTO | null;
  gradingInfo: UserProxyRequest | null;
  session: SessionStateMessage | null;
  schemeId: string | null;

  constructor() {
    this.markingGuide = null;
    this.seedQuestionsResponse = null;
    this.questionResponse = null;
    this.candidate = null;
    this.gradingInfo = null;
    this.session = null;
    this.schemeId = null;
  }
}
