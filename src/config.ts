import Config from "./lib/ts/config";

/* Basic configuration file for server settings */
const config: Config = {
    version: 1,
    port: 8080,
    bcryptHashRounds: 10,
    cardRequestEmail: "info@thelandbetween.ca",
    secret: process.env.SECRET as string,
    bodyParserMax: "8MB",
    urlEncodedMax: "8MB",
    authTokenLifetime: "24h",
    refreshTokenLifetime: "30d",
    logDirectory: "/var/log/tg-server/",
    imageDirectory: "/data/images/",
    tempDirectory: "/tmp/",
    databaseOptions: {
        url: "mongodb://",
        port: 27017,
        dbName: "TurtleGuardians",
        username: process.env.DB_ROOT_USER as string,
        password: process.env.DB_ROOT_PW as string
    },
    emailOptions: {
        service: "gmail",
        port: 465,
        auth: {
            user: "",
            pass: "",
        },
    },
    mailchimpListId: "78069862a5",
    mailchimpURL: "https://us8.api.mailchimp.com/3.0/",
    geocoderURL: "https://geocoder.ca/",
    supportOptions: {
        host: "cayenne.websavers.ca",
        port: 465,
        secureConnection: true,
        name: "TurtleGuardiansServer",
        ignoreTls: false,
        debug: true,
        auth: {
            user: "support@turtlewalk.ca",
            pass: "0SHQscyraly@p5p3",
        },
    },
    defaultUser: {
        firstName: "Admin",
        lastName: "Admin",
        password: "Password123!",
        admin: true,
        email: "landbetweendeveloper@gmail.com",
        activated: true,
        accountType: "email"
      },
    verificationOptions: {
        tokenLifetime: "30d",
        //baseUrl: "https://server.turtleguardians.com/",
        baseUrl: "http://localhost:8080/",
        tokenSecret: process.env.TOKEN_SECRET as string,
    },
    passwordResetOptions: {
        tokenLifetime: "8h",
        //baseUrl: "https://server.turtleguardians.com/"
        baseUrl: "http://localhost:8080/"
    },
    facebook: {
        app_id: "2318054821808468",
        app_secret: "6aa7aa7a400e56f861b002e1a58b4a8e",
        //callback: "https://server.turtleguardians.com/",
        callback: "http://localhost:8080/"
    },
};

export default config;