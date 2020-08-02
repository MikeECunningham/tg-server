import { NextFunction, Response, Request } from "express";
import { Servlet } from "@src/lib/ts/servlet";
import config from "@src/config";
const servlet = new Servlet();

servlet.get = async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return res.end(
        `<script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
        <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
        <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>
        <style>
          .form-gap {
            padding-top: 70px;
        }
        </style>
        <script>
          $(document).ready(function () {
            var $submitBtn = $("#submitButton");
            var $passwordBox = $("#password");
            var $confirmBox = $("#confirm_password");
            var $errorMsg = $('#errMsg');
            var $before = $('#beforeComplete');
            var $after = $('#afterComplete');
            $after.hide();
            // This is incase the user hits refresh - some browsers will maintain the disabled state of the button.
            $submitBtn.removeAttr("disabled");
            $errorMsg.hide();
            function checkMatchingPasswords() {
              if ($confirmBox.val() !== "" && $passwordBox.val !=="") {
                if ($confirmBox.val() !== $passwordBox.val()) {
                  $submitBtn.attr("disabled", "disabled");
                  $errorMsg.show();
                }
              }
            }
            function resetPasswordError() {
              $submitBtn.removeAttr("disabled");
              $errorMsg.hide();
            }
            function setError(val) {
              $errorMsg.html(val);
              $errorMsg.show();
              console.log(val);
            }
            $("#confirm_password, #password")
              .on("keydown", function (e) {
                /* only check when the tab or enter keys are pressed
                 * to prevent the method from being called needlessly  */
                if (e.keyCode == 13 || e.keyCode == 9) {
                  checkMatchingPasswords();
                }
                console.log('down');
              })
              .on("blur", function () {
                // also check when the element looses focus (clicks somewhere else)
                checkMatchingPasswords();
              })
              .on("focus", function () {
                // reset the error message when they go to make a change
                resetPasswordError();
              });
            $("#submitButton").click(function (e) {
              e.preventDefault();
              const token = new URL(window.location.href).searchParams.get('token');
              $.ajax({
                url: '${config.verificationOptions.baseUrl}api/auth/resetPassword',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ token: token, password: $passwordBox.val() }),
                success: (res) => {
                  console.log(res)
                  if (res.failure) {
                    setError(res.failure);
                  } else {
                    $before.hide();
                    $after.show();
                  }
                },
                error: (err) => {
                  setError('Error reaching server');
                }
              });
            });
          });
        </script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
        <div class="form-gap"></div>
        <div id='beforeComplete' class="container">
          <div class="row">
            <div class="col-md-4 col-md-offset-4">
              <div class="panel panel-default">
                <div class="panel-body">
                  <div class="text-center">
                      <img src="https://www.turtlewalk.ca/wp-content/uploads/2018/05/TG-Stacked-Web-300x115.png"
                      style="width: 250px; height: 100px">
                    <h2 class="text-center">Reset Password</h2>
                    <p>Enter your new password here.</p>
                    <div class="panel-body">
                      <div class="form-group">
                        <div class="input-group">
                          <span class="input-group-addon"><i class="glyphicon glyphicon-lock color-blue"></i></span>
                          <input id="password" name="password" placeholder="new password" class="form-control" type="password">
                        </div>
                        <br>
                        <div class="input-group">
                          <span class="input-group-addon"><i class="glyphicon glyphicon-lock color-blue"></i></span>
                          <input id="confirm_password" name="confirm_password" placeholder="confirm new password" class="form-control"
                            type="password">
                        </div>
                        <p id='errMsg' style='color:crimson'>Passwords do not match.</p>
                      </div>
                      <div class="form-group">
                        <button class="btn btn-lg btn-primary btn-block" id='submitButton'>Reset Password</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="afterComplete" class="container">
            <div class="row">
                <div class="col-md-4 col-md-offset-4">
                  <div class="panel panel-default">
                    <div class="panel-body">
                      <div class="text-center">
                          <img src="https://www.turtlewalk.ca/wp-content/uploads/2018/05/TG-Stacked-Web-300x115.png"
                          style="width: 250px; height: 100px">
                        <h2 class="text-center">Password reset Successfully</h2>
                        <p>You can now log into the turtle guardians app using your new password</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
        `
    );
};

export default servlet;