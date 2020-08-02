export default interface Config {
    /** The current app version */
    version: number;
    /** The port the server starts on */
    port: number;
    /** The number of rounds to run the bcrypt hash for */
    bcryptHashRounds: number;
    logDirectory: string;
    imageDirectory: string;
    tempDirectory: string;
    cardRequestEmail: string;
    /** The secret used for jwt(replace with a key in production) */
    secret: string;
    /** The URL used for the MailChimp API */
    mailchimpURL: string;
    /** The ID used for the MailChimp list */
    mailchimpListId: string;
    /** The default admin account, to be regenerated each startup */
    defaultUser: {
        /** Login Username */
        firstName: string;
        /** Name of the account user */
        lastName: string;
        /** Blowfish hashed password */
        password: string;
        /** Is an Admin */
        admin: boolean;
        /** Admin Email */
        email: string;
        /** Is Admin Activated */
        activated: boolean;
        /** Type of Account */
        accountType: string;
    }
    /** The URL used for geocoder */
    geocoderURL: string;
    /** The byte limitation on the body parser parsing */
    bodyParserMax: string;
    /** The byte limitation on the size of url encoded data */
    urlEncodedMax: string;
    /** The ammount of time an authentication token is valid for */
    authTokenLifetime: string;
    /** The ammount of time an refresh token is valid for */
    refreshTokenLifetime: string;
    /** Options for the mongoose connection */
    databaseOptions: {
        /**The url of the connection */
        url: string;
        /**The port of the connection */
        port: number;
        /**The name of the db to use in the connection */
        dbName: string;
        /**The name of the auth user */
        username: string;
        /**The password of the auth user */
        password: string;
    };
    /** The smtp options used for sending verification and password reset emails */
    emailOptions: {
        /** service used for emails */
        service: string;
        /** port of the SMTP server */
        port?: number;
        /** if ssl should be used*/
        secure?: boolean;
        /** the name of the client server */
        name?: string;
        /** ignore server support for STARTTLS */
        ignoreTls?: boolean;
        /** output client and server messages to console */
        debug?: boolean;
        /** authentication object with the info needed to  */
        auth: {
            user: string;
            pass: string;
        };
    };
    /** The smtp options used for sending support emails and updates on server status */
    supportOptions: {
        /** hostname of the SMTP server */
        host: string;
        /** port of the SMTP server */
        port: number;
        /** if ssl should be used*/
        secureConnection: boolean;
        /** the name of the client server */
        name: string;
        /** ignore server support for STARTTLS */
        ignoreTls: boolean;
        /** output client and server messages to console */
        debug: boolean;
        /** authentication object with the info needed to  */
        auth: {
            user: string;
            pass: string;
        };
    };
    /** The options for the account verification tokens sent to users emails */
    verificationOptions: {
        /** The lifetime of the verification token */
        tokenLifetime: string;
        /** The base url of the link for the verification email */
        baseUrl: string;
        /** The secret used for generating and validating the verification tokens */
        tokenSecret: string;
    };
    /** The options for password reset emails */
    passwordResetOptions: {
        /** The lifetime of the reset token */
        tokenLifetime: string;
        /** The base url of the link for the reset email */
        baseUrl: string;
    };

    /** The object holding the settings for connecting to facebook oauth*/
    facebook: {
        app_id: string;
        app_secret: string;
        callback: string;
    };
}
