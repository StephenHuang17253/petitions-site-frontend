import {
    Card, CardMedia,
    Checkbox,
    CssBaseline, FormControl,
    FormControlLabel,
    Grid, IconButton,
    InputAdornment, InputLabel, OutlinedInput,
    Paper,
    Select,
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
import MenuItem from "@mui/material/MenuItem";
import {useSnackbar} from "notistack";


const CreatePetition = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [titleErrorText, setTitleErrorText] = useState<string>("Petition must have title");
    const [descriptionError, setDescriptionError] = useState<boolean>(false);
    const [categoryError, setCategoryError] = useState<boolean>(false);
    const [titleError, setTitleError] = useState<boolean>(false);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const [fileSizeErrorText, setFileSizeErrorText] = useState<string>("image must be jpeg, png, or gif, and less than 5MB.");
    const [fileUpload, setFileUpload] = useState<File | null>(null);
    const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
    const userLogin = useAuthStore(state => state.userLogin);
    const token= useAuthStore(state => state.token);
    const userId = useAuthStore(state => state.userId);
    const [contentType, setContentType] = useState<string>("");
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const [supportTiers, setSupportTiers] = useState<supportTierPost[]>([{ title: '', description: '', cost: 0 }]);
    const [tooManyTiersError, setTooManyTiersError] = useState<boolean>(false);
    const [supportTierError, setSupportTierError] = useState<boolean>(false);
    const [anotherSupportTierError, setAnotherSupportTierError] = useState<boolean>(false);
    const [supportTierErrorText, setSupportTierErrorText] = useState<string>("Support tier title must be unique within petition");
    const [tierDescriptionError, setTierDescriptionError] = useState<boolean>(false);
    const [tierDescriptionErrorText, setTierDescriptionErrorText] = useState<string>("Tier description can't be empty.");
    const [tierCostError, setTierCostError] = useState<boolean>(false);
    const [tierCostErrorText, setTierCostErrorText] = useState<string>("Tier cost can't be empty.");
    const [petitionCategories, setPetitionCategories] = React.useState<category[]>([])
    const [categoryId, setCategoryId] = React.useState<number>(-1);
    const [petitionId, setPetitionId] = React.useState<number>(-1);
    const [internalServerError, setInternalServerError] = React.useState<boolean>(false);

    React.useEffect(() => {

        if (!isAuthenticated) {
            navigate('/login');
        }

    }, []);

    React.useEffect(() => {

        if (categoryId !== -1) {
            setCategoryError(false)
        }

    }, [categoryId]);

    React.useEffect(() => {
        if (petitionId !== -1 && fileUpload) {
            setPetitionImage()
        }

    }, [petitionId]);

    React.useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4941/api/v1/petitions/categories/');
                setPetitionCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        getCategories()
    }, [])

    const postPetition = async () => {

        const requestBody = {
            title,
            description,
            categoryId,
            supportTiers}

        try {
            const response = await axios.post(`http://localhost:4941/api/v1/petitions/`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            console.log('Petition created successfully');
            setPetitionId(response.data.petitionId)
            enqueueSnackbar("Petition created")

        } catch (error: any) {
            console.error('Failed to create petition', error);
            if (error.response && error.response.statusText === "Forbidden: Duplicate petition") {
                setTitleError(true);
                setTitleErrorText("Another petition already has this title");
            }
            if (error.response.status === 400) {
                setAnotherSupportTierError(true)
                setSupportTierErrorText("Invalid support tiers, check your titles, descriptions, and costs.")
                if (error.response.statusText.includes("supportTiers must have unique titles")){
                    setSupportTierError(true);
                    setSupportTierErrorText("Titles of support tiers must be unique within a petition");
                }
                if (error.response.statusText.includes("Bad Request: data/supportTiers must NOT have fewer than 1 items")){
                    setSupportTierError(true);
                    setSupportTierErrorText("Petition must have at least one support tier.");
                }
                if (error.response.statusText.includes("Bad Request: data/supportTiers/0/title must NOT have fewer than 1 characters")){
                    setSupportTierError(true);
                    setSupportTierErrorText("Support tiers must have a title.");
                }
                if (error.response.statusText.includes("Bad Request: data/supportTiers/0/description must NOT have fewer than 1 characters")){
                    setTierDescriptionError(true);
                    setSupportTierErrorText("Support tiers must have a description.");
                }
                if (error.response.statusText.includes("Bad Request: data/supportTiers/0/cost")){
                    setTierCostError(true);
                    setSupportTierErrorText("Invalid cost for support tier.");
                }

            }
            if (error.response.status === 404 || error.response.status === 401) {
                alert("Something went wrong, check the console for more information.")
            }


        }

    };

    const setPetitionImage = async () => {
        console.log("Attempting to set petition image")
        if (!fileUpload) {
            throw new Error("No petition image");
        }


        const reader = new FileReader();
        reader.onload = async (event) => {
            const binaryData = event.target!.result as ArrayBuffer;
            try {
                const response = await axios.put(`http://localhost:4941/api/v1/petitions/${petitionId}/image`,
                    binaryData, {
                        headers: {
                            'Content-Type': contentType,
                            'X-Authorization': token
                        }
                    });
                console.log('Petition image set successfully');
                navigate(`/petitions/${petitionId}`)
            } catch (error: any) {
                console.error('Failed to set petition picture', error);
            }
        }
        reader.readAsArrayBuffer(fileUpload);
    }


    const validateTitleLength = (value: string): boolean => value.trim().length >= 1;
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        if (!validateTitleLength(title)) {
            setTitleError(true);
        }
        if (!validateTitleLength(description)) {
            setDescriptionError(true);

        }

        if (categoryId === -1) {
            setCategoryError(true);
        }

        if (!fileUpload) {
            setFileSizeError(true)
            setFileSizeErrorText("Petition must have image")
        }

        if (!categoryError && !titleError && !descriptionError && fileUpload) {
            await postPetition()
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
            setFileSizeError(false)
            console.log(`file was succesfully uploaded: ${fileUpload}`);
        }

    };

    const handleTierChange = (index: number, field: keyof supportTierPost, newValue: string) => {
        const values = [...supportTiers];
        if (field === 'cost') {
            const cost = Number(newValue);
            if (isNaN(cost) || cost < 0 || cost > 999999) {
                setTierCostError(true); // Set the error state to true
                setTierCostErrorText("Cost must be a positive number between 0 and 99999.");
            } else {
                values[index][field] = cost;
            }
        } else {
            values[index][field] = newValue;
        }

        setSupportTiers(values);
    };

    const handleTierRemove = (index: number) => {
        const values = [...supportTiers];
        values.splice(index, 1);
        setSupportTiers(values);
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
                    maxWidth: "50%",
                    alignItems: "center",
                    display: "flex",
                    padding: "24px",
                }}>

                    <Typography component="h1" variant="h4" sx={{paddingBottom: "24px"}}>
                        Create Petition
                    </Typography>

                    {/*{previewImage && (*/}
                    {/*    <CardMedia>*/}
                    {/*        <img src={previewImage} alt="Profile" style={{ width: '400px', height: '200px', objectFit: 'scale-down' }} />*/}
                    {/*    </CardMedia>*/}
                    {/*)}*/}

                    {previewImage && (
                        <CardMedia
                            component="img"
                            height="250"
                            width="100%"
                            sx={{objectFit: "cover"}}
                            image={previewImage}
                            alt="Petition hero"
                        />
                    )}

                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={2}>


                            <Grid item xs={12}>
                                <Typography>Set Petition Image (required)</Typography>


                                <TextField
                                    error={fileSizeError}
                                    helperText={fileSizeError ? fileSizeErrorText : ""}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="petitionImage"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Grid>

                            <Grid item xs={12} >
                                <TextField
                                    error={titleError}
                                    helperText={titleError ? titleErrorText : ""}
                                    autoComplete="title"
                                    name="title"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="title"
                                    label="Title"
                                    onChange={(e) => {
                                        setTitle(e.target.value)
                                        setTitleError(!validateTitleLength(e.target.value))
                                    }}
                                    autoFocus/>
                            </Grid>


                            <Grid item xs={12}>
                                <TextField
                                    error={descriptionError}
                                    helperText={descriptionError ? "cannot be empty." : ""}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    multiline
                                    maxRows={5}
                                    id="description"
                                    label="Description"
                                    name="description"
                                    onChange={(e) => {
                                        setDescription(e.target.value)
                                        setDescriptionError(!validateTitleLength(e.target.value))
                                    }}
                                    autoComplete="description"/>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel required>Category</InputLabel>
                                    <Select
                                        error={categoryError}
                                        labelId="petitionCategory"
                                        id="petitionCategory"
                                        variant="outlined"
                                        required
                                        label="Category"
                                        onChange={(e) => setCategoryId(parseInt(e.target.value as string))}
                                    >
                                        {petitionCategories.map((category) => (
                                            <MenuItem key={category.categoryId} value={category.categoryId}>{category.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {categoryError && (
                                    <Typography color="error">Please select a category.</Typography> // Customize the error message as needed
                                )}
                            </Grid>


                            {supportTiers.map((tier, index) => (
                                <Grid item xs={12} sm={4} md={4} lg={4} key={index}>
                                    <div>
                                        <TextField
                                            error={supportTierError}
                                            label={`Support Tier ${index + 1}`}
                                            onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                                            required
                                        />
                                        <TextField
                                            error={tierDescriptionError}
                                            label="Description"
                                            multiline
                                            maxRows={8}
                                            onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                                            required
                                        />
                                        <TextField
                                            error={tierCostError}
                                            label="Cost"
                                            type="number"
                                            onChange={(e) => handleTierChange(index, 'cost', e.target.value)}
                                            required
                                        />
                                        <Button onClick={() => handleTierRemove(index)}>Remove</Button>
                                    </div>
                                </Grid>
                            ))}
                            <Grid item xs={12}>

                                {(supportTierError || tierDescriptionError || anotherSupportTierError) && (
                                    <Typography gutterBottom sx={{color: "darkRed"}}>
                                        {supportTierErrorText}
                                    </Typography>
                                )}

                                <Button
                                    onClick={() => {
                                        // Check if the current number of support tiers is less than 3
                                        if (supportTiers.length < 3) {
                                            setSupportTiers([...supportTiers, { title: '', description: '', cost: 0 }]);
                                        } else {
                                            // Optionally, show a message or perform another action if the limit is reached
                                            setTooManyTiersError(true)

                                        }
                                    }}
                                >
                                    Add Support Tier
                                </Button>
                                {tooManyTiersError && (
                                    <Typography gutterBottom>
                                        {"Maximum of 3 support tiers."}
                                    </Typography>
                                )}
                                  </Grid>

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



                    </form>
                </Card>

            </div>



        </>
    );
}

export default CreatePetition;
