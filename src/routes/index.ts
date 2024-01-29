import "express-async-errors";
import { RequestHandler, Router } from "express";
import { Docs } from "../models/doc.model";
import { ApiError } from "../errors/ApiError";
import { env } from "../config/env";
import * as val from "../validators/docs.validator";

const router = Router();

export interface Ipagination {
  limit: number;
  skip: number;
  page: number;
  filter: any;
}

const paginationMiddleware: RequestHandler = async (req, res, next) => {
  const limit = +(req.query.limit || 10);
  const page = +(req.query.page || 1);
  const skip = limit * (page - 1);
  (req as any)["pagination"] = <Ipagination>{ limit, page, skip, filter: {} };
  next();
};

const auth: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ").at(-1);
  if (!token) return next(new ApiError("token required", 401));
  const credintials = Buffer.from(token, "base64").toString("utf-8");
  const [username, password] = credintials.split(":");

  if (username !== env.auth.username || password !== env.auth.password)
    return next(new ApiError("invalid credintials", 401));
  next();
};

router
  .route("/docs")
  .all(auth)
  .post(...val.create, async (req, res, next) => {
    await Docs.create(req.body);
    res.status(201).json();
  })
  .get(paginationMiddleware, async (req, res, next) => {
    const pagination: Ipagination = (req as any)["pagination"];
    const count = await Docs.countDocuments();
    const docs = await Docs.aggregate([
      {
        $group: {
          _id: "$tag",
          documents: { $push: "$$ROOT" },
        },
      },
    ])
      .limit(pagination.limit)
      .skip(pagination.skip);
    // const docs = await Docs.find()
    //   .limit(pagination.limit)
    //   .skip(pagination.skip);
    res.status(200).json({ count, data: docs });
  });

router
  .route("/docs/:docId")
  .all(auth, val.docId)
  .get(async (req, res, next) => {
    const doc = await Docs.findOne({ _id: req.params.docId });
    if (!doc) return next(new ApiError("doc not found", 404));
    res.status(200).json(doc);
  })
  .patch(...val.update, async (req, res, next) => {
    const doc = await Docs.findOneAndUpdate(
      { _id: req.params.docId },
      req.body
    );
    if (!doc) return next(new ApiError("can't update this document", 400));
    res.status(200).json();
  })
  .delete(async (req, res, next) => {
    const doc = await Docs.findOneAndDelete({ _id: req.params.docId });
    if (!doc) return next(new ApiError("doc not found", 404));
    res.status(204).json();
  });

export const apiRoutes = router;
