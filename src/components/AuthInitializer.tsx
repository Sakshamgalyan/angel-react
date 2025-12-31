"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchCurrentUser } from "@/store/slices/authSlice";

export default function AuthInitializer() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return null;
}
