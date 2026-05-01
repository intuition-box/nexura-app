export type TASKS = {
  _id: string;
  submissionLink: string;
  page: string;
  status: "done" | "retry" | "pending";
  taskType: string;
  username: string;
  campaignId: string;
  campaignCompleted: string;
  validatedBy: string;
  user: string;
  createdAt?: string;
};
