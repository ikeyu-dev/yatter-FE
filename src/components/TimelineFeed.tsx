"use client";

import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { YweetCard } from "@/components/YweetCard";
import { PostYweetForm } from "@/components/PostYweetForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Yweet } from "@/types/yweet";

type TimelineFeedProps = {
    initialYweets: Yweet[];
};

export function TimelineFeed({ initialYweets }: TimelineFeedProps) {
    const { user, getAuthenticationHeader } = useAuth();
    const isLoggedIn = !!user;

    const [yweets, setYweets] = useState<Yweet[]>(initialYweets);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleted, setIsDeleted] = useState(false);

    const isOpen = deletingId !== null;
    console.log("isOpen", isOpen, "deletingId", deletingId);

    function handlePosted(created: Yweet) {
        // TODO:ask this, prevはどういう働き？
        setYweets((prev) => [created, ...prev]);
    }

    function handleDelete(id: number) {
        setDeletingId(id);
    }

    function handleCancel() {
        setDeletingId(null);
        setIsDeleted(false);
    }

    async function handleConfirm() {
        if (deletingId === null) {
            return;
        }

        const authentication = getAuthenticationHeader();
        if (!authentication) {
            setDeletingId(null);
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/yweets/${deletingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authentication: authentication,
                    },
                },
            );
            if (!res.ok) {
                throw new Error("削除に失敗しました");
            }

            setYweets((prev) =>
                prev.filter((yweet) => yweet.id !== deletingId),
            );
            setIsDeleted(true);
        } catch {
            setDeletingId(null);
            setIsDeleted(false);
        }
    }

    return (
        <>
            <ConfirmDialog
                isOpen={isOpen}
                message={
                    isDeleted ? "削除しました" : "この Yweet を削除しますか？"
                }
                showConfirm={!isDeleted}
                cancelLabel={isDeleted ? "閉じる" : "キャンセル"}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
            {isLoggedIn && <PostYweetForm onPosted={handlePosted} />}
            {yweets.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                    まだ Yweet がありません
                </p>
            ) : (
                yweets.map((yweet) => {
                    const isOwn = user?.username === yweet.user.username;
                    return (
                        <YweetCard
                            key={yweet.id}
                            username={yweet.user.username}
                            content={yweet.content}
                            avatarUrl={yweet.user.avatar}
                            onDelete={
                                isOwn ? () => handleDelete(yweet.id) : undefined
                            }
                        />
                    );
                })
            )}
        </>
    );
}
