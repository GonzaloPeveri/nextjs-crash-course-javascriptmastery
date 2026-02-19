import mongoose, { Schema, models, model } from "mongoose";

const NameSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default models.Name || model("Name", NameSchema);
