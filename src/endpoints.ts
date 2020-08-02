/** Protected endpoints */
import emaiLogin from "./endpoints/auth/emailLogin";
import facebookLogin from "./endpoints/auth/facebookLogin";
import resetPasswordPage from "./endpoints/auth/resetPasswordPage";
import resendVerificationEmail from "./endpoints/auth/resendVerificationEmail";
import deleteAccount from "./endpoints/profile/deleteAccount";

import requestCard from "./endpoints/misc/requestCard";

import getObservations from "./endpoints/observation/getObservations";

import editProfile from "./endpoints/profile/editProfile";
import passTest from "./endpoints/profile/passTest";

import changePassword from "./endpoints/auth/changePassword";

/** Public endpoints */
import emailLogin from "./endpoints/auth/emailLogin";
import emailSignUp from "./endpoints/auth/emailSignUp";
import requestPasswordReset from "./endpoints/auth/requestPasswordReset";
import resetPassword from "./endpoints/auth/resetPassword";
import verifyEmail from "./endpoints/auth/verifyEmail";
import submitObservation from "./endpoints/observation/submitObservation";

//ADMIN STUFF TO BE DELETED
import getAllObservations from "./endpoints/admin/getAllObservations";
import getAllUsers from "./endpoints/admin/getAllUsers";
import getAllProjects from "./endpoints/admin/getAllProjects";
import submitProject from "./endpoints/admin/createNewProject";
import getObservationImage from "./endpoints/admin/getObservationImage";
import deleteObservation from "./endpoints/admin/deleteObservation";
import deleteImage from "./endpoints/admin/deleteImage";
import deleteUser from "./endpoints/admin/deleteUser";
import deleteProject from "./endpoints/admin/deleteProject";
import createnewProject from "./endpoints/admin/createNewProject";
import updatePrivileges from "./endpoints/admin/updatePrivileges";
import activateUser from "./endpoints/admin/activateUser";

export const privateEndpoints = [
    [emaiLogin, "/api/auth/emailLogin"],
    [facebookLogin, "/api/auth/facebookLogin"],
    [deleteAccount, "/api/auth/deleteAccount"],
    [resendVerificationEmail, "/api/auth/resendVerificationEmail"],
    [changePassword, "/api/auth/changePassword"],

    [requestCard, "/api/misc/requestCard"],

    [getObservations, "/api/observation/getObservations"],

    [editProfile, "/api/profile/editProfile"],
    [passTest, "/api/profile/passTest"],

    //ADMIN CORNER
    [getAllObservations, "/api/admin/getAllObservations"],
    [getAllUsers, "/api/admin/getAllUsers"],
    [getAllProjects, "/api/admin/getAllProjects"],
    [submitProject, "/api/admin/submitProject"],
    [getObservationImage, "/api/admin/getObservationImage"],
    [deleteObservation, "/api/admin/deleteObservation"],
    [deleteImage, "/api/admin/deleteImage"],
    [deleteUser, "/api/admin/deleteUser"],
    [deleteProject, "/api/admin/deleteProject"],
    [createnewProject, "/api/admin/createNewProject"],
    [updatePrivileges, "/api/admin/updatePrivileges"],
    [activateUser, "/api/admin/activateUser"]
];

export const publicEndpoints = [
    [emailLogin, "/api/auth/emailLogin"],
    [emailSignUp, "/api/auth/emailSignUp"],
    [requestPasswordReset, "/api/auth/requestPasswordReset"],

    [submitObservation, "/api/observation/submitObservation"],
    [resetPasswordPage, "/api/auth/resetPasswordPage"],
    [resetPassword, "/api/auth/resetPassword"],
    [verifyEmail, "/api/auth/verifyEmail"]
];