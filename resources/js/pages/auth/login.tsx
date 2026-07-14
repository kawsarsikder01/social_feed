import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import LoginForm from '@/components/LoginForm';
import { register } from '@/routes';


export default function Login() {
    return (
        <>
            <Head title="Log in" />

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                <div className="_social_login_content">
                    <div className="_social_login_left_logo _mar_b28">
                        <img
                            src="/assets/images/logo.svg"
                            alt="Image"
                            className="_left_logo"
                        />
                    </div>

                    <p className="_social_login_content_para _mar_b8">
                        Welcome back
                    </p>

                    <h4 className="_social_login_content_title _titl4 _mar_b50">
                        Login to your account
                    </h4>

                    <GoogleSignInButton onClick={() => { }} />

                    <div className="_social_login_content_bottom_txt _mar_b40">
                        <span>Or</span>
                    </div>

                    <LoginForm />

                    <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div className="_social_login_bottom_txt">
                                <p className="_social_login_bottom_txt_para">
                                    Don't have an account?{" "}
                                    <Link href={register()}>
                                        Create New Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

