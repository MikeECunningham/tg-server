function getCardRequestEmail(address: string, fullName: string, email: string): string {
    return `
    <table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%;text-align: center;">
        <tr>
            <td>Address</td>
            <td>${address}</td>
        </tr>
        <tr>
            <td>Full Name</td>
            <td>${fullName}</td>
        </tr>
        <tr>
            <td>Email</td>
            <td>${email}</td>
        </tr>
    </table>
    `;
}

export default getCardRequestEmail;