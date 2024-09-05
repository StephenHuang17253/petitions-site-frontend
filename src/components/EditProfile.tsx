import {Link, useLocation, useNavigate} from "react-router-dom";
import Register from "./Register";
import ResponsiveAppBar from "./Navbar";
import React, {useState} from "react";
import CSS from "csstype";
import {
    Alert,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import {Check, DeleteOutline, Visibility, VisibilityOff} from "@mui/icons-material";
import useAuthStore from "../store";
import axios from "axios";
import Button from "@mui/material/Button";
import {enqueueSnackbar} from "notistack";

const EditProfile = () => {
    const navigate = useNavigate();
    const user = useAuthStore();
    const [userInfo, setUserInfo] = React.useState<UserInfo>({
        email: "",
        firstName: "",
        lastName: "",
    })
    const [userImageLink, setUserImageLink] = React.useState<string>("");
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorText, setEmailErrorText] = useState<string>("Email must contain an @ and a top-level domain e.g., \"a@b.c\"");
    const [email, setEmail] = useState<string>(userInfo.email);
    const [firstName, setFirstName] = useState<string>(userInfo.firstName);
    const [lastName, setLastName] = useState<string>(userInfo.lastName);
    const [firstNameError, setFirstNameError] = useState<boolean>(false);
    const [lastNameError, setLastNameError] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordError, setNewPasswordError] = useState<boolean>(false);
    const [passwordErrorText, setPasswordErrorText] = React.useState<string>("Incorrect old password");
    const [newPasswordErrorText, setNewPasswordErrorText] = React.useState<string>("Cannot have a new password shorter than 6 characters.");
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [contentType, setContentType] = useState<string>("");


    React.useEffect(() => {

        if (!user.isAuthenticated) {
            navigate('/login');
        }
        getUser()
        getUserImage()


    }, [])

    React.useEffect(() => {

        setEmail(userInfo.email)
        setFirstName(userInfo.firstName)
        setLastName(userInfo.lastName)

    }, [userInfo])

    const editUser = async () => {

        const newUserInfo = {
            firstName,
            lastName,
            email,
            ...(password && {currentPassword: password}),
            ...(newPassword && {password: newPassword})
        }

        try {
            const response = await axios.patch(`http://localhost:4941/api/v1/users/${user.userId}/`,
                newUserInfo,
                {
                    headers: {
                        'X-Authorization': user.token
                    }});
            setUserInfo(response.data);
            console.log("Successfully edited user info")
            navigate('/profile')
            enqueueSnackbar("Profile updated")
        } catch (error: any) {
            console.error('Error editing user:', error)
            if (error.response && error.response.statusText === "Forbidden: Email already in use") {
                console.log("Email already in use");
                setEmailError(true);
                setEmailErrorText("Email already in use");
            }
            if (error.response && error.response.statusText === "Incorrect currentPassword") {
                console.log("Incorrect current password");
                setPasswordError(true);
                setPasswordErrorText("Incorrect current password.");
            }


        }
    }

    const getUser = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${user.userId}/`,
                {
                    headers: {
                        'X-Authorization': user.token
                    }});
            setUserInfo(response.data);
            console.log("Successfully got user info")
        } catch (error) {
            console.error('Error fetching user:', error);

        }
    }

    const getUserImage = async () => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${user.userId}/image`,
                {
                    headers: {
                        'accept': 'image/*',
                        'X-Authorization': user.token
                    },responseType: 'arraybuffer'});
            const imageUrl = URL.createObjectURL(new Blob([response.data])); // Adjust the MIME type accordingly
            setUserImageLink(imageUrl);
        } catch (error) {
            console.error('Error fetching user image:', error);
        }
    }

    const deleteUserImage = async () => {
        try {
            const response = await axios.delete(`http://localhost:4941/api/v1/users/${user.userId}/image`,
                {
                    headers: {
                        'accept': '*/*',
                        'X-Authorization': user.token
                    }});
            console.log(`Delete user image status: ${response.status}`)
            setUserImageLink("")
        } catch (error) {
            console.error('Error deleting user image:', error);
        }
    }

    const deleteUserProfilePicture = async () => {
        await deleteUserImage()
    }

    const setUserPicture = async () => {
        console.log("Attempting to set user profile picture")
        if (!fileUpload) {
            throw new Error("No profile picture selected");
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const binaryData = event.target!.result as ArrayBuffer;
            try {
                const response = await axios.put(`http://localhost:4941/api/v1/users/${user.userId}/image`,
                    binaryData, {
                        headers: {
                            'Content-Type': contentType,
                            'X-Authorization': user.token
                        }
                    });
                console.log('User picture set successfully');

            } catch (error: any) {
                console.error('Failed to set user picture', error);
            }
        }
        reader.readAsArrayBuffer(fileUpload);

    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Attempting to upload file")
        if (event.target.files && event.target.files[0]) {
            const image = event.target.files[0]

            // 5MB limit
            if (image.size > 5 * 1024 * 1024) {
                setFileSizeError(true)
                return
            }

            switch (image.type) {
                case 'image/png':
                    setContentType('image/png');
                    break;
                case 'image/jpeg':
                case 'image/jpg':
                    setContentType('image/jpeg')
                    break;
                case 'image/gif':
                    setContentType('image/gif');
                    break;
                default:
                    setFileSizeError(true)
                    console.log("User uploaded unsupported file type")
                    return;
            }
            console.log(`Content-Type: ${contentType}`)
            const previewImageUrl = URL.createObjectURL(image)
            setFileSizeError(false)
            setUserImageLink(previewImageUrl);
            setFileUpload(image);
            console.log(`file was succesfully uploaded: ${fileUpload}`);
        }
    }

    const validateEmail = (value: string): boolean => {
        // regex from reference server
        const emailRegex =
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        return emailRegex.test(value);
    };
    const validateNameLength = (value: string): boolean => value.trim().length >= 1;
    const validatePasswordLength = (value: string): boolean => value.length >= 6;
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }
    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    }


    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleBack = () => {
        navigate('/profile')
    }

    const handleSubmit = async () => {
        // event.preventDefault(); // Prevent default form submission

        if (!validateEmail(email)) {
            setEmailError(true);
            setEmailErrorText("Email must contain an @ and a top-level domain e.g., \"a@b.c\"")
            return;
        }
        if (!validateNameLength(firstName)) {
            setFirstNameError(true);
            return;
        }
        if (!validateNameLength(lastName)) {
            setLastNameError(true);
            return;
        }
        if (newPassword) {
            if (!validatePasswordLength(password)) {
                setPasswordError(true);
                return;
            }
            if (!validatePasswordLength(newPassword)) {
                setNewPasswordError(true);
                return;
            }
            if (password === newPassword) {
                setNewPasswordError(true);
                setNewPasswordErrorText("New password cannot be same as old.")
                return;
            }

        }

        let response = await editUser();

        if (fileUpload) {
            await setUserPicture()
        }


    };

    const card: CSS.Properties = {
        padding: "70px",
        margin: "20px",
        display: "block",
        alignItems: "center",
        justifySelf: "center",
        width: "98%",

    }

    return (

        <>
            <ResponsiveAppBar/>

            <div style={card}>

                <Card elevation={5} sx={{
                    flexDirection: "column",
                    margin: "auto",
                    maxWidth: "32%",
                    alignItems: "center",
                    padding: "24px",
                }}>


                    <Grid item xs={12}>
                        <CardHeader
                            sx={{
                                display: "block",
                                width: "60%",
                                margin: "auto",
                                justifyContent: 'center',
                                justifyItems: "center",
                                alignItems: 'center',

                            }}

                            avatar={

                                <Avatar
                                    sx={{
                                        display: "block",
                                        margin: "auto",
                                        height: "265px",
                                        width: "265px",
                                        objectFit: "contain"
                                    }}
                                    alt={userInfo.firstName}
                                    src={userImageLink}
                                />
                            }
                        />

                        <Button onClick={deleteUserProfilePicture} sx={{marginBottom: "16px"}}>
                            Remove picture
                        </Button>

                    </Grid>


                        <form noValidate onSubmit={handleSubmit}>
                            <Grid container spacing={2}>

                                <Grid item xs={12}>
                                    <Typography>Change Profile Picture</Typography>
                                    <TextField
                                        error={fileSizeError}
                                        helperText={fileSizeError ? "image must be jpeg, png, or gif, and less than 5MB." : ""}
                                        variant="outlined"
                                        fullWidth
                                        id="profilePicture"
                                        type="file"
                                        onChange={handleFileChange}
                                    />

                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        error={firstNameError}
                                        helperText={firstNameError ? "must be at least 1 character." : ""}
                                        value={firstName}
                                        autoComplete="fname"
                                        name="firstName"
                                        variant="outlined"
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        onChange={(e) => {
                                            setFirstName(e.target.value)
                                            setFirstNameError(!validateNameLength(e.target.value))
                                        }}
                                        />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        error={lastNameError}
                                        helperText={lastNameError ? "must be at least 1 character." : ""}
                                        value={lastName}
                                        variant="outlined"
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        onChange={(e) => {
                                            setLastName(e.target.value)
                                            setLastNameError(!validateNameLength(e.target.value))
                                        }}
                                        autoComplete="lname"/>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        error={emailError}
                                        helperText={emailError ? emailErrorText : ""}
                                        value={email}
                                        variant="outlined"
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setEmailError(!validateEmail(e.target.value))
                                        }}
                                        autoComplete="email"/>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box >
                                        <TextField
                                            error={passwordError}
                                            helperText={passwordError ? passwordErrorText : ""}
                                            variant="outlined"
                                            fullWidth
                                            name="password"
                                            label="Current password"
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            onChange={(e) => {
                                                setPassword(e.target.value)
                                                setPasswordError(!validatePasswordLength(e.target.value))
                                            }}

                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="show password"
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}
                                                        >
                                                            {showPassword? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}

                                            autoComplete="current-password"/>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box >
                                        <TextField
                                            error={newPasswordError}
                                            helperText={newPasswordError ? newPasswordErrorText : ""}
                                            variant="outlined"
                                            fullWidth
                                            name="password"
                                            label="New password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            id="password"
                                            onChange={(e) => {
                                                setNewPassword(e.target.value)
                                                setNewPasswordError(!validatePasswordLength(e.target.value))
                                            }}

                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="show new password"
                                                            onClick={handleClickShowNewPassword}
                                                        >
                                                            {showNewPassword? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}

                                            autoComplete="new-password"/>
                                    </Box>

                                </Grid>

                                <Grid item xs={12}>

                                    <Button onClick={() => handleBack()} sx={{color: "red"}}>
                                            Go Back
                                    </Button>

                                    <Button onClick={() => handleSubmit()} sx={{color: "#007bff"}} >
                                        Save Changes
                                    </Button>


                                </Grid>
                            </Grid>
                        </form>



                </Card>
            </div>

        </>

)
}



export default EditProfile;