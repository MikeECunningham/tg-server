function getTestResultsEmail(results: string, errors: string, hasError: boolean) {
    return `
<div style="background-color: #f4f4f5;">
    <table cellpadding="0" cellspacing="0"
        style="width: 100%; height: 100%; background-color: #f4f4f5; text-align: center;">
        <tbody>
            <tr>
                <td style="text-align: center;">
                    <table align="center" cellpadding="0" cellspacing="0"
                        style="background-color: #fff; width: 100%; max-width: 680px; height: 50%;">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" cellpadding="0" cellspacing="0" class="page-center"
                                        style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
                                        <tbody>
                                            <tr>
                                                <td colspan="2"
                                                    style="text-align:center;padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #000000; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-smoothing: always; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; mso-line-height-rule: exactly; text-decoration: none;">
                                                    Automated Tests ${!hasError ? "Passed" : "Failed"}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 48px; padding-bottom: 48px;">
                                                    <table cellpadding="0" cellspacing="0" style="width: 100%">
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style="width: 100%; height: 1px; max-height: 1px; background-color: #d9dbe0; opacity: 0.81">
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                                    Here are the results of an automated deployment test:<br>
                                                    <pre style="margin-bottom: 1em;
                                                    padding: 5px;
                                                    padding-bottom: 20px;
                                                    width: auto;
                                                    width: 650px;
                                                    max-height: 600px;
                                                    overflow: auto;
                                                    font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, sans-serif;
                                                    font-size: 13px;
                                                    background-color: #eff0f1;"><code>${results}</code><pre>
                                                </td>
                                            </tr>
                                            ${hasError ? `
                                            <tr>
                                                <td
                                                    style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095a2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                                    Here are the errors encountered:<br>
                                                    <pre style="margin-bottom: 1em;
                                                    padding: 5px;
                                                    padding-bottom: 20px;
                                                    width: auto;
                                                    width: 650px;
                                                    max-height: 600px;
                                                    overflow: auto;
                                                    font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, sans-serif;
                                                    font-size: 13px;
                                                    background-color: #eff0f1;"><code>${errors}</code><pre>
                                                </td>
                                            </tr>` : ``}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table align="center" cellpadding="0" cellspacing="0" id="footer" style="background-color: #000; width: 100%; max-width: 680px; height: 50%;">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" cellpadding="0" cellspacing="0" class="footer-center" style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
                                        <tbody>
                                            <tr>
                                                <td colspan="2" style="padding-top: 72px; padding-bottom: 24px; width: 100%;">
                                                    <img src="https://www.turtlewalk.ca/wp-content/uploads/2018/05/TG-Stacked-Web-300x115.png"
                                                        style="width: 250px; height: 100px">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding-bottom: 48px;">
                                                    <table cellpadding="0" cellspacing="0" style="width: 100%">
                                                        <tbody>
                                                            <tr>
                                                                <td style="width: 100%; height: 1px; max-height: 1px; background-color: #EAECF2; opacity: 0.19"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; color: #9095A2; font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-smoothing: always; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; mso-line-height-rule: exactly; text-decoration: none; vertical-align: top; width: 100%;">
                                                    This test was performed automatically as a result of a git repositiory push.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="height: 72px;"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;
}
export default getTestResultsEmail;