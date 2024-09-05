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
import {Link, useNavigate} from "react-router-dom";
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

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const userLogin = useAuthStore(state => state.userLogin);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    React.useEffect(() => {

        if (isAuthenticated) {

            navigate('/');
        }
    }, []);


    const login = async () => {
        try {
            const response = await axios.post(`http://localhost:4941/api/v1/users/login`, {
                email,
                password
            });
            console.log('User logged in successfully');
            userLogin(response.data.token, response.data.userId)
            navigate('/petitions')
            enqueueSnackbar("Signed in")
        } catch (error) {
            console.error('Failed to login user', error);

            setErrorMessage("No account matches those credentials.")

        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };



    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        login(); // Call the login function with the userData object

    };

    const card: CSS.Properties = {
        padding: "110px",
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
                    display: "flex",
                    padding: "26px",
                }}>

                    <Typography component="h1" variant="h4" sx={{paddingBottom: "24px"}}>
                        Sign in
                    </Typography>
                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"/>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    onChange={(e) => setPassword(e.target.value)}
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
                            </Grid>

                        </Grid>

                        {errorMessage && <Typography sx={{paddingTop: "4px"}} color="error">{errorMessage}</Typography>}

                        <Button
                            sx={{marginTop: "16px", width: "100%", borderRadius: "32px",
                                padding: "1em"
                            }}
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                        >
                            Continue
                        </Button>

                        <Grid >
                            <Grid item sx={{padding: "8px"}}>
                                Not a member?
                                <Link to={"/register"}>
                                    {` Join now`}
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

export default Login;
