import Stories from '@/components/Stories';
import PostForm from '@/components/PostForm';

export default function Welcome() {
    return (
        <div className="_layout_middle_wrap">
            <div className="_layout_middle_inner">
                <Stories />
                <PostForm />
            </div>
        </div>
    );
}
