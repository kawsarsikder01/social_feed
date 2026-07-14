export default function RememberForgotRow() {
  return (
    <div className="row">
      <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
        <div className="form-check _social_login_form_check">
          <input
            className="form-check-input _social_login_form_check_input"
            type="checkbox"
            name="remember"
            id="remember"
            value="1"
          />

          <label
            className="form-check-label _social_login_form_check_label"
            htmlFor="remember"
          >
            Remember me
          </label>
        </div>
      </div>

      <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
        <div className="_social_login_form_left">
          <a
            href="/forgot-password"
            className="_social_login_form_left_para"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}