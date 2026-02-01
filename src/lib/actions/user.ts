'use server';

import { auth0 } from '@/lib/auth0';
import dbConnect from '@/lib/db/connect';
import User, { IUser } from '@/lib/models/User';

export async function getUser(auth0Id: string) {
    await dbConnect();
    const user = await User.findOne({ auth0Id }).lean();
    if (user) {
        return { ...user, _id: user._id.toString() };
    }
    return null;
}

export async function createUser(data: Partial<IUser>) {
    await dbConnect();
    const user = await User.create(data);
    return { ...user.toObject(), _id: user._id.toString() };
}

export async function updateUser(auth0Id: string, data: Partial<IUser>) {
    await dbConnect();
    const user = await User.findOneAndUpdate(
        { auth0Id },
        { $set: data },
        { new: true, upsert: true } // Create if not exists (for transitioning users)
    ).lean();

    if (user) {
        return { ...user, _id: user._id.toString() };
    }
    return null;
}

export async function getCurrentUser() {
    const session = await auth0.getSession();
    if (!session?.user) return null;
    return getUser(session.user.sub);
}
