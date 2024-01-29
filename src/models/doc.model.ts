import { model, Schema } from "mongoose";

export interface Idoc extends Document {
  tag: String;
  title: string;
  desc: string;
  url: string;
  method: string;
  queries: [{ field: { type: String; required: true }; desc?: String }];
  parameters: [
    {
      field: string;
      type: string;
      desc?: string;
      isRequired: boolean;
    }
  ];
  requestType: String;
  headers: string;
  success: { status: number; response?: string };
  errors: [{ status: number; response: string }];
}

export const Docs = model<Idoc>(
  "docs",
  new Schema<Idoc>({
    tag: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    url: { type: String, required: true },
    requestType: { type: String, default: "json" },
    method: { type: String, required: true },
    queries: [{ field: { type: String, required: true }, desc: String }],
    parameters: [
      {
        field: { type: String, required: true },
        type: { type: String, required: true },
        desc: String,
        isRequired: { type: Boolean, required: true, default: true },
      },
    ],
    headers: String,
    success: {
      status: { type: Number, required: true },
      response: String,
    },
    errors: [
      {
        status: { type: Number, required: true },
        response: { type: String, required: true },
      },
    ],
  })
);
