import mongoose from "mongoose";

const subscriberSchema = mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);