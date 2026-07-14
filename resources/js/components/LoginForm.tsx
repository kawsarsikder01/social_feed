import { Form } from "@inertiajs/react";
import { store } from '@/routes/login';
import FormInput from "./FormInput";
import RememberForgotRow from "./RememberForgotRow";




export default function LoginForm() { 

    return (
        <Form
            {...store.form()}
            resetOnSuccess={["password"]}
            className="_social_login_form"
        >
            {({ processing, errors }) => {
                 
                return (
                    <>
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <FormInput
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                />

                                {errors.email && (
                                    <div className="text-danger mt-1">{errors.email}</div>
                                )}
                            </div>

                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                <FormInput
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                />

                                {errors.password && (
                                    <div className="text-danger mt-1">{errors.password}</div>
                                )}
                            </div>
                        </div>

                        <RememberForgotRow />

                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                                <div className="_social_login_form_btn _mar_t40 _mar_b60">
                                    <button
                                        type="submit"
                                        className="_social_login_form_btn_link _btn1"
                                        disabled={processing}
                                    >
                                        {processing ? "Logging in..." : "Login now"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                );
            }}
        </Form>
    );
}