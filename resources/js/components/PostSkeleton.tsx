const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: 4,
};

function SkeletonBlock({ width, height, style }: { width?: string | number; height?: string | number; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                ...shimmerStyle,
                width: width ?? '100%',
                height: height ?? 14,
                ...style,
            }}
        />
    );
}

export default function PostSkeleton() {
    return (
        <>
            <style>{shimmerKeyframes}</style>
            <div
                className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
                style={{ pointerEvents: 'none' }}
            >
                <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                    {/* Header: avatar + name + time */}
                    <div className="_feed_inner_timeline_post_top" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <SkeletonBlock width={36} height={36} style={{ borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <SkeletonBlock width="40%" height={14} style={{ marginBottom: 6 }} />
                            <SkeletonBlock width="25%" height={10} />
                        </div>
                    </div>

                    {/* Content lines */}
                    <div style={{ marginTop: 16 }}>
                        <SkeletonBlock height={12} style={{ marginBottom: 8, width: '95%' }} />
                        <SkeletonBlock height={12} style={{ marginBottom: 8, width: '80%' }} />
                        <SkeletonBlock height={12} style={{ width: '60%' }} />
                    </div>

                    {/* Image placeholder */}
                    <div style={{ marginTop: 14 }}>
                        <SkeletonBlock height={200} style={{ borderRadius: 8 }} />
                    </div>
                </div>

                {/* Likes/Comments summary bar */}
                <div
                    className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26"
                    style={{ display: 'flex', gap: 8, paddingTop: 12, paddingBottom: 12 }}
                >
                    <SkeletonBlock width={60} height={12} />
                    <SkeletonBlock width={80} height={12} />
                </div>

                {/* Reaction buttons bar */}
                <div
                    className="_feed_inner_timeline_reaction"
                    style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, display: 'flex', gap: 24, paddingLeft: 24, paddingRight: 24 }}
                >
                    <SkeletonBlock width={60} height={14} />
                    <SkeletonBlock width={80} height={14} />
                </div>
            </div>
        </>
    );
}
