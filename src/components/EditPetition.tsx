import {
    Card,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    Select,
    TextField,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Button from "@mui/material/Button";
import CSS from "csstype";
import ResponsiveAppBar from "./Navbar";
import axios from "axios";
import useAuthStore from "../store";
import MenuItem from "@mui/material/MenuItem";
import {useSnackbar} from 'notistack';


const EditPetition = () => {
    const navigate = useNavigate();
    const { id} = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const [petition, setPetition] = useState<PetitionFull>({
        categoryId: 0,
        creationDate: "",
        description: "",
        moneyRaised: 0,
        numberOfSupporters: 0,
        ownerFirstName: "",
        ownerId: 0,
        ownerLastName: "",
        petitionId: 0,
        supportTiers: [],
        supportingCost: 0,
        title: "Not Found"});
    const [previewImage, setPreviewImage] = useState<string | null>(`http://localhost:4941/api/v1/petitions/${id}/image`);
    const [title, setTitle] = useState<string>(petition.title);
    const [titleErrorText, setTitleErrorText] = useState<string>("Petition must have title");
    const [description, setDescription] = useState<string>(petition.description);
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
    const [supportTiers, setSupportTiers] = useState<supportTier[]>(petition.supportTiers);
    const [tooManyTiersError, setTooManyTiersError] = useState<boolean>(false);
    const [tooManyTiersErrorText, setTooManyTiersErrorText] = useState<string>("");
    const [supportTierError, setSupportTierError] = useState<boolean>(false);
    const [anotherSupportTierError, setAnotherSupportTierError] = useState<boolean>(false);
    const [supportTierErrorText, setSupportTierErrorText] = useState<string>("Tier title must be unique and non-empty");
    const [tierDescriptionError, setTierDescriptionError] = useState<boolean>(false);
    const [tierDescriptionErrorText, setTierDescriptionErrorText] = useState<string>("Tier description can't be empty.");
    const [tierCostError, setTierCostError] = useState<boolean>(false);
    const [tierCostErrorText, setTierCostErrorText] = useState<string>("Invalid tier cost.");
    const [petitionCategories, setPetitionCategories] = React.useState<category[]>([])
    const [categoryId, setCategoryId] = React.useState<number>(petition.categoryId);
    const [patchPetitionError, setPatchPetitionError] = React.useState<boolean>(false)
    const [openConfirm, setOpenConfirm] = React.useState<boolean>(false)
    const [supporters, setSupporters] = React.useState<supporter[]>([])



    React.useEffect(() => {

        if (!isAuthenticated) {
            console.log("Not authenticated")
            enqueueSnackbar("Not authenticated")
            navigate('/login');
        }

        if (petition.ownerId !== 0) {
            if (userId !== null && parseInt(userId) !== petition.ownerId) {
                navigate('/petitions')
                enqueueSnackbar("Not the owner", {variant: "error"})
                console.log("Not the owner")

            }
        }

    }, [petition]);


    React.useEffect(() => {

        if (categoryId !== -1) {
            setCategoryError(false)
        }


        for (const tier of supportTiers) {
            if (tier.title === "") {
                setSupportTierError(true);
                setSupportTierErrorText("Tier title can't be empty and must be unique.");
                enqueueSnackbar("Tier title can't be empty and must be unique.", {variant:"error"})
            } else {
                setSupportTierError(false)
            }

            if (tier.description === "") {
                setTierDescriptionError(true);
                setTierDescriptionErrorText("Tier description can't be empty.");
            } else {
                setTierDescriptionError(false)
            }

            if (tier.cost < 0 || isNaN(tier.cost)) {
                setTierCostError(true)
                setTierCostErrorText("Invalid tier cost")
                enqueueSnackbar("Tier cost can't be negative, and must be a number", {variant:"error"})
            } else {
                setTierCostError(false)
            }
        }

    }, [categoryId, supportTiers]);

    React.useEffect(() => {
        console.log(supportTiers)

    }, [supportTiers]);

    React.useEffect(() => {

       setTitle(petition.title)
       setDescription(petition.description)
       setSupportTiers(petition.supportTiers)
       setCategoryId(petition.categoryId)

    }, [petition])

    React.useEffect(() => {


        if (fileUpload) {
            setPetitionImage()
        } else {
            setPreviewImage(`http://localhost:4941/api/v1/petitions/${id}/image`)
        }

    }, [id]);

    React.useEffect(() => {

        const getPetitionDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}`);
                setPetition(response.data);
            } catch (error) {
                console.error('Failed to load petition details:', error);
            }
        };
        getPetitionDetails();

        const getCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4941/api/v1/petitions/categories/');
                setPetitionCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        getCategories()

        const getSupporters = async () => {
            try {
                const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`);
                setSupporters(response.data);
            } catch (error) {
                console.error('Failed to get petition supporters:', error);
            }
        };
        getSupporters();
    }, [])

    const patchPetition = async () => {

        const requestBody = {
            title,
            description,
            categoryId,
            }

        try {
            const response = await axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            setPatchPetitionError(false)
            console.log('Petition edited successfully');
        } catch (error: any) {
            console.error('Failed to edit petition', error);
            setPatchPetitionError(true)
            enqueueSnackbar(`${error.response.statusText}`, {variant:"error"})
            if (error.response && error.response.statusText === "Forbidden: Duplicate petition") {
                setTitleError(true);
                setTitleErrorText("Another petition already has this title");
            }
            if (error.response.status === 400) {
                setAnotherSupportTierError(true)
                setSupportTierErrorText("Invalid petition information")
                enqueueSnackbar(`${error.response.statusText}`, {variant:"error"})
            }
            if (error.response.status === 404 || error.response.status === 401) {
                alert("Something went wrong, check the console for more information.")
            }


        }

    };

    const deletePetition = async () => {
        console.log('Attempting to delete petition')
        try {
            const response = await axios.delete(`http://localhost:4941/api/v1/petitions/${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            console.log('Petition deleted successfully');

            enqueueSnackbar('Petition deleted!', { variant: 'success' })

            setTimeout(() => {
                navigate('/petitions/mine')
                window.location.reload();
            }, 300)

        } catch (error) {
            console.error('Failed to delete petition', error);
        }
    };

    const addSupportTier = async (tier: supportTierPost) => {
        console.log("add support tier was called")
        try {
            const response = await axios.put(`http://localhost:4941/api/v1/petitions/${id}/supportTiers`, tier, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            console.log('Support tier added successfully');
        } catch (error: any) {
            console.error('Failed to add support tier', error)
            setSupportTierError(true)
            setSupportTierErrorText(error.response.statusText)
            enqueueSnackbar(`${error.response.statusText}`, {variant:"error"})
        }
    };

    const updateSupportTier = async (tierId: number, updatedTier: supportTierPost) => {
        try {
            const response = await axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${tierId}`, updatedTier, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            console.log('Support tier updated successfully');
        } catch (error: any) {
            console.error('Failed to update support tier', error);
            setSupportTierError(true)
            enqueueSnackbar(`${error.response.statusText}`, {variant:"error"})
        }
    };

    const deleteSupportTier = async (tierId: number) => {
        try {
            const response = await axios.delete(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${tierId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': token
                }
            });
            console.log('Support tier deleted successfully');
        } catch (error: any) {
            console.error('Failed to delete support tier', error);
            setSupportTierError(true)
            enqueueSnackbar(`${error.response.statusText}`, {variant:"error"})
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
                const response = await axios.put(`http://localhost:4941/api/v1/petitions/${id}/image`,
                    binaryData, {
                        headers: {
                            'Content-Type': contentType,
                            'X-Authorization': token
                        }
                    });
                console.log('Petition image set successfully');
            } catch (error: any) {
                console.error('Failed to set petition picture', error);
            }
        }
        reader.readAsArrayBuffer(fileUpload);
    }


    const validateTitleLength = (value: string): boolean => value.trim().length >= 1;
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission

        console.log("Handling changes")

        if (!validateTitleLength(title)) {
            setTitleError(true);
        }
        if (!validateTitleLength(description)) {
            setDescriptionError(true);

        }

        if (categoryId === -1) {
            setCategoryError(true);
        }

        if (!previewImage) {
            setFileSizeError(true)
            setFileSizeErrorText("Petition must have image")
        }

        if (hasDuplicateTitles(supportTiers)) {
            setSupportTierError(true);
            setSupportTierErrorText("Tier title can't be empty and must be unique.")
            return;
        }

        for (let tier of supportTiers) {
            const supporter = supporters.find(supporter => supporter.supportTierId === tier.supportTierId);
            if (tier.supportTierId !== -1 && !supporter) {
                await updateSupportTier(tier.supportTierId, tier);
            }
            if (tier.supportTierId === -1) {
                let tierPost: supportTierPost = {
                    title: tier.title,
                    description: tier.description,
                    cost: tier.cost
                }
                console.log(tierPost)
                await addSupportTier(tierPost)
            }
        }



        const originalIds = petition.supportTiers.map(tier => tier.supportTierId);
        const updatedIds = supportTiers.map(tier => tier.supportTierId);
        const deletedIds = originalIds.filter(id => !updatedIds.includes(id));

        for (const id of deletedIds) {
            await deleteSupportTier(id);
        }


        if (!categoryError &&!titleError &&!descriptionError &&!fileSizeError && !supportTierError
            && !anotherSupportTierError &&!tierDescriptionError &&!tierCostError) {
            if (fileUpload) {
                await setPetitionImage()
            }

            await patchPetition()

            console.log("petition patched")
            enqueueSnackbar('Petition updated!', { variant: 'success' })
            setTimeout(() => {
                navigate(`/petitions/${id}`)
                window.location.reload();
            }, 550)

        }

    }

    const hasDuplicateTitles = (supportTiers: any[]) => {
        const titles = supportTiers.map(tier => tier.title).map(String); // Convert to string to handle case sensitivity
        return titles.length!== new Set(titles).size;
    }

    const handleDelete = async () => {
        if (petition.numberOfSupporters === 0) {
            await deletePetition()
        } else {
            enqueueSnackbar("Cannot delete a petition that has supporters", {variant: "error"})
        }
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
            setPreviewImage(previewImageUrl)

            setFileUpload(image);
            setFileSizeError(false)
            console.log(`file was succesfully uploaded: ${fileUpload}`);
        }

    };

    const handleTierChange = (index: number, field: keyof supportTierPost, newValue: string) => {
        const values = [...supportTiers];
        if (field === 'cost') {
            values[index][field] = Number(newValue);
        } else {
            values[index][field] = newValue;
        }
        setSupportTiers(values);
    };

    const handleTierRemove = (index: number) => {
        if (supportTiers.length > 1) {
            const values = [...supportTiers];
            values.splice(index, 1);
            setSupportTiers(values);
        } else {
            setTooManyTiersError(true)
            setTooManyTiersErrorText("Can't remove last support tier.")
        }

    };

    const tiersWithSupporterInfo = supportTiers.map(tier => ({
        ...tier,
        hasSupporter:!!supporters.find(supporter => supporter.supportTierId === tier.supportTierId)
    }));

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
                        Edit Petition
                    </Typography>

                    <Button
                        sx={{
                            marginBottom: "16px", width: "35%", borderRadius: "32px",
                            padding: "0.5em"
                        }}
                        variant="contained"
                        color="error"
                        onClick={() => setOpenConfirm(true)}
                    >
                        Delete Petition
                    </Button>


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
                                <Typography>Change Petition Image</Typography>


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
                                    value={title}
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
                                    value={description}
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
                                        value={categoryId}
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


                            {tiersWithSupporterInfo.map((tier, index) => (
                                <Grid item xs={12} sm={4} md={4} lg={4} key={index}>
                                    <div>
                                        <TextField
                                            disabled={tier.hasSupporter}
                                            error={supportTierError}
                                            label={`Support Tier ${index + 1}`}
                                            value={tier.title}
                                            onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                                            required
                                        />
                                        <TextField
                                            disabled={tier.hasSupporter}
                                            error={tierDescriptionError}
                                            label="Description"
                                            value={tier.description}
                                            multiline
                                            maxRows={8}
                                            onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                                            required
                                        />
                                        <TextField
                                            disabled={tier.hasSupporter}
                                            error={tierCostError}
                                            label="Cost"
                                            value={tier.cost}
                                            type={"number"}
                                            onChange={(e) => handleTierChange(index, 'cost', e.target.value)}
                                            required
                                        />
                                        {!tier.hasSupporter && (
                                            <Button onClick={() => handleTierRemove(index)}>Remove</Button>
                                        )}
                                        <Typography gutterBottom variant={"subtitle2"}>{tier.hasSupporter ? "Tiers with supporters can't be changed" : ""}</Typography>
                                    </div>
                                </Grid>
                            ))}
                            <Grid item xs={12}>

                                {(supportTierError || anotherSupportTierError) && (
                                    <Typography gutterBottom color="error">
                                        {supportTierErrorText}
                                    </Typography>
                                )}

                                {(tierDescriptionError || anotherSupportTierError) && (
                                    <Typography gutterBottom color="error">
                                        {tierDescriptionErrorText}
                                    </Typography>
                                )}

                                <Button
                                    onClick={() => {
                                        // Check if the current number of support tiers is less than 3
                                        if (supportTiers.length < 3) {
                                            setSupportTiers([...supportTiers, { title: '', description: '', cost: 0, supportTierId: -1 }]);
                                        } else {
                                            // Optionally, show a message or perform another action if the limit is reached
                                            setTooManyTiersError(true)
                                            setTooManyTiersErrorText("Can't have more than 3 support tiers")

                                        }
                                    }}
                                >
                                    Add Support Tier
                                </Button>
                                {tooManyTiersError && (
                                    <Typography gutterBottom color="error">
                                        {tooManyTiersErrorText}
                                    </Typography>
                                )}
                            </Grid>

                        </Grid>

                        <Button
                            sx={{
                                marginTop: "16x", width: "51%", borderRadius: "32px",
                                padding: "1em"
                            }}
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Save Changes
                        </Button>

                        <Button
                            sx={{
                                marginTop: "16x", width: "51%", borderRadius: "32px",
                                padding: "1em"
                            }}
                            onClick={() => navigate(`/petitions/mine`)}
                            color="error"
                        >
                            Cancel & Go back
                        </Button>

                    </form>
                </Card>

            </div>

            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center'}}>
                    {"Deleting this petition cannot be undone."}
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center'}}>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>




        </>
    );
}

export default EditPetition;
