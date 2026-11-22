"use client";

import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import type { Yweet } from "@/types/yweet";

type PostYweetFormProps = {
    onPosted: (yweet: Yweet) => void;
};

export function PostYweetForm({ onPosted }: PostYweetFormProps) {
    const [postBody, setPostBody] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- エラー表示を追加する際に使用する
    const [err, setErr] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getAuthenticationHeader } = useAuth();

    const handlePostBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPostBody(e.target.value);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (postBody.trim() === "") {
            setErr("本文を入力してください");
            return;
        }

        const authentication = getAuthenticationHeader();
        if (!authentication) {
            setErr("投稿するにはログインが必要です");
            return;
        }

        setErr("");
        setIsSubmitting(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/v1/yweets",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authentication: authentication,
                    },
                    body: JSON.stringify({
                        yweet: postBody,
                    }),
                },
            );

            if (!res.ok) {
                setErr("投稿に失敗しました");
                return;
            }

            const created = (await res.json()) as Yweet;
            onPosted(created);
            setPostBody("");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form
            className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3"
            onSubmit={handleSubmit}
        >
            <Textarea
                name="yweet"
                placeholder="いまどうしてる？"
                value={postBody}
                onChange={handlePostBody}
            />
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    投稿する
                </Button>
            </div>
        </form>
    );
}
