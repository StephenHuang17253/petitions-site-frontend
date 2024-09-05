import {
    Card,
    Checkbox,
    CssBaseline,
    FormControlLabel,
    Grid, IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {ErrorResponse, Link, useNavigate} from "react-router-dom";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {LockOutlined, Visibility, VisibilityOff} from "@mui/icons-material";
import CSS from "csstype";
import ResponsiveAppBar from "./Navbar";
import axios from "axios";
import useAuthStore from "../store";
import {enqueueSnackbar} from "notistack";


const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorText, setEmailErrorText] = useState<string>("Email must contain an @ and a top-level domain e.g., \"a@b.c\"");
    const [firstNameError, setFirstNameError] = useState<boolean>(false);
    const [lastNameError, setLastNameError] = useState<boolean>(false);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const userLogin = useAuthStore(state => state.userLogin);
    const [userId, setUserId] = useState<number>(-1);
    const [token, setToken] = useState<string>("");
    const [contentType, setContentType] = useState<string>("");
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    React.useEffect(() => {

        if (isAuthenticated) {

            navigate('/');
            enqueueSnackbar("User not authenticated")
        }
    }, []);

    React.useEffect(() => {
        console.log("Profile picture state:", fileUpload);
    }, [fileUpload]);

    React.useEffect(() => {
        console.log("userId:", userId);
        if (userId !== -1 && photoUploaded) {
            setUserPicture()
        }


    }, [userId]); //


    const registerUser = async () => {
        try {
            const response = await axios.post(`http://localhost:4941/api/v1/users/register`, {
                email,
                firstName,
                lastName,
                password
                });
            console.log('User registered successfully');
            await login()

        } catch (error: any) {
            console.error('Failed to register user', error);
            if (error.response && error.response.status === 403) {
                setEmailError(true)
                setEmailErrorText("Email already in use")

            }
        }
    };

    const login = async () => {
        try {
            const response = await axios.post(`http://localhost:4941/api/v1/users/login`, {
                email,
                password
            });
            console.log('User logged in successfully');
            userLogin(response.data.token, response.data.userId)
            setUserId(response.data.userId)
            setToken(response.data.token)

            if (fileUpload) {
                setPhotoUploaded(true)
            } else {
                navigate('/home')
            }
            enqueueSnackbar("Account registered")
        } catch (error) {
            console.error('Failed to login user', error);

        }
    };


    const setUserPicture = async () => {
        console.log("Attempting to set user profile picture")
        if (!fileUpload) {
            throw new Error("No profile picture selected");
        }


        const reader = new FileReader();
        reader.onload = async (event) => {
            const binaryData = event.target!.result as ArrayBuffer;
            try {
                const response = await axios.put(`http://localhost:4941/api/v1/users/${userId}/image`,
                    binaryData, {
                        headers: {
                            'Content-Type': contentType,
                            'X-Authorization': token
                        }
                    });
                console.log('User picture set successfully');
                navigate('/home')
            } catch (error: any) {
                console.error('Failed to set user picture', error);
            }
        }
        reader.readAsArrayBuffer(fileUpload);

    }


    const validatePasswordLength = (value: string): boolean => value.length >= 6;
    const validateEmail = (value: string): boolean => {
        // regex from reference server
        const emailRegex =
            /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        return emailRegex.test(value);
    };
    const validateNameLength = (value: string): boolean => value.trim().length >= 1;
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        if (!validatePasswordLength(password)) {
            setPasswordError(true);

        }
        if (!validateEmail(email)) {
            setEmailError(true);
            setEmailErrorText("Email must contain an @ and a top-level domain e.g., \"a@b.c\"")

        }
        if (!validateNameLength(firstName)) {
            setFirstNameError(true);

        }
        if (!validateNameLength(lastName)) {
            setLastNameError(true);

        }

        if (!passwordError && !emailError && !firstNameError && !lastNameError) {
            await registerUser();
        }


    };

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
            setPreviewImage(previewImageUrl)

            setFileUpload(image);
            console.log(`file was succesfully uploaded: ${fileUpload}`);
        }

    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };


    const card: CSS.Properties = {
        padding: "110px",
        margin: "20px",
        display: "block",
        alignItems: "center",
        justifySelf: "center",
        width: "98%",
        height: "720px"

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
                display: "flex",
                padding: "24px",
            }}>

                <Typography component="h1" variant="h4" sx={{paddingBottom: "24px"}}>
                    Sign up
                </Typography>

                {previewImage && (
                    <Avatar sx={{ width: 125, height: 125, marginBottom: "16px"}}>
                        <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Avatar>
                )}

                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={2}>


                            <Grid item xs={12} sm={6}>
                                <TextField
                                    error={firstNameError}
                                    helperText={firstNameError ? "must be at least 1 character." : ""}
                                    autoComplete="fname"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    onChange={(e) => {
                                        setFirstName(e.target.value)
                                        setFirstNameError(!validateNameLength(e.target.value))
                                    }}
                                    autoFocus/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    error={lastNameError}
                                    helperText={lastNameError ? "must be at least 1 character." : ""}
                                    variant="outlined"
                                    required
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
                                    variant="outlined"
                                    required
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
                                        helperText={passwordError ? "The password must be at least 6 characters in length." : ""}
                                        variant="outlined"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
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
                                <Typography>Set Profile Picture (optional)</Typography>
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



                            {/*<Grid item xs={12}>*/}
                            {/*    <FormControlLabel*/}
                            {/*        control={<Checkbox value="allowExtraEmails" color="primary" />}*/}
                            {/*        label="I want to receive inspiration, marketing promotions and updates via email."*/}
                            {/*    />*/}
                            {/*</Grid>*/}
                        </Grid>

                        <Button
                            sx={{
                                marginTop: "16px", width: "100%", borderRadius: "32px",
                                padding: "1em"
                            }}
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Continue
                        </Button>


                        <Grid>
                            <Grid item sx={{padding: "8px"}}>
                                <Link to={"/login"}>
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
            </Card>
            {/*<Box mt={5}>*/}
            {/*    <Copyright />*/}
            {/*</Box>*/}
        </div>
        </>
);
}

export default Register;
