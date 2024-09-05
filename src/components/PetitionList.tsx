import axios from 'axios';
import React, {ChangeEvent} from "react";
import CSS from 'csstype';
import {
    Paper,
    AlertTitle,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormGroup,
    FormControlLabel,
    useTheme,
    Pagination,
    Typography,
    OutlinedInput,
    Chip,
    SelectChangeEvent,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, Theme, IconButton
} from "@mui/material";
import PetitionListObject from "./PetitionListObject";
import ResponsiveAppBar from './Navbar';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import ClearIcon from '@mui/icons-material/Clear';
import CancelIcon from '@mui/icons-material/Clear';
import {CancelOutlined, CancelTwoTone, Delete, SearchOff} from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


const PetitionList = () => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [petitions, setPetitions] = React.useState<Petition | null>(null)
    const [petitionStartIndex, setPetitionStartIndex] = React.useState((currentPage-1) * 10)
    const [petitionsCount, setPetitionsCount] = React.useState<number>(0)
    const [petitionQuery, setPetitionQuery] = React.useState("")
    const [petitionCategories, setPetitionCategories] = React.useState<category[]>([])
    const [petitionSupportingCost, setPetitionSupportingCost] = React.useState<number>(0)
    const [petitionOwnerId, setPetitionOwnerId] = React.useState<number>(0)
    const [petitionSupporterId, setPetitionSupporterId] = React.useState<number>(0)
    const [petitionSortBy, setPetitionSortBy] = React.useState("")
    const [supportingCostFilter, setSupportingCostFilter] = React.useState<number>(Infinity);
    const [inputQuery, setQueryInput] = React.useState("")
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [categoryName, setCategoryName] = React.useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);


    React.useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4941/api/v1/petitions/categories/');
                setPetitionCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Handle error state or show a message to the user
            }
        }
        getCategories()
    }, [])

    React.useEffect(() => {
        console.log(`page number: ${currentPage}`)
        console.log(`start index: ${petitionStartIndex}`)

        let params = `startIndex=${petitionStartIndex}&count=10`;

        if (petitionQuery) {
            params += `&q=${petitionQuery}`;
        }
        if (supportingCostFilter !== Infinity) {
            params += `&supportingCost=${supportingCostFilter}`;
        }
        if (selectedCategories.length > 0) {
            const categoryParams = selectedCategories.map(categoryId => `categoryIds=${categoryId}`).join('&');

            params += `&${categoryParams}`
        }
        if (petitionSortBy !== "") {
            params += `&sortBy=${petitionSortBy}`;
        }




        const getPetitions = () => {
            axios.get(`http://localhost:4941/api/v1/petitions?${params}`)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetitions(response.data.petitions)
                    setPetitionsCount(response.data.count)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString()
                    )
                })
        }

        getPetitions()
        updateQuery()
    }, [setPetitions, currentPage, inputQuery, supportingCostFilter, selectedCategories, petitionSortBy])

    const petition_rows = () => {
        if (!Array.isArray(petitions)) return null; // Handle null/undefined
        return petitions.map((petition: Petition) => (
            <PetitionListObject key={petition.petitionId + petition.title} petition={petition} />
        ));
    };

    const handleCategoryChange = (event: SelectChangeEvent<typeof selectedCategories>) => {
        const {
            target: { value },
        } = event;
        setSelectedCategories(value as number[]); // Directly assign the value as an array of numbers

    };


    const handleClearCategorySelection = () => {
        setSelectedCategories([]); // Clear all selected categories
    };

    const handleClearSortSelection = () => {
        setPetitionSortBy(""); // Clear all selected categories
    };



    const handleSortByChange = (event: SelectChangeEvent) => {
        setPetitionSortBy(event.target.value as string);
    };

    function handleInputSearch(query: string) {
        setQueryInput(query);
    }


    const updateQuery = () => {
        if (inputQuery.trim().length >= 1) {
            setPetitionQuery(inputQuery? `${inputQuery}` : '');
        }
    };

    const handleSupportingCostChange = (event: Event, newValue: number | number[]) => {
        setSupportingCostFilter(newValue as number);
    };



    const handlePageChange = (event: React.ChangeEvent<unknown>, nextPage: number) => {
        setCurrentPage(nextPage);
        setPetitionStartIndex((nextPage-1)*10)
        console.log(petitionStartIndex)
        // Optionally, fetch new data based on the selected page
    };

    const getCategoryColor = (categoryName: string): string => {
        // Define a mapping of category names to chip colors
        const categoryColorMap: Record<string, string> = {
            "Animal Rights": '#4CAF50', // Green
            "Arts and Culture": '#9C27B0', // Purple
            "Community Development": '#2196F3', // Blue
            "Economic Empowerment": '#FF9800', // Orange
            "Education": '#2196F3', // Blue
            "Environmental Causes": '#4CAF50', // Green
            "Health and Wellness": '#e52a2a', // Red
            "Human Rights": '#FF5252', // Red
            "Science and Research": '#2196F3FF',  // Blue
            "Sports and Recreation": '#FF521B', // Red
            "Technology and Innovation": '#0E568EFF', // Dark Blue
            "Wildlife": '#006600FF'  // Dark green




        };
        return categoryColorMap[categoryName] || '#999999FF'; // Should never be gray tbh
    };

    function getStyles(category: category, theme: Theme) {
        return {
            fontWeight:
                petitionCategories.indexOf(category) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }


    const theme = useTheme();

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        alignItems: "center",
        width: "98%"
    }

    const filterAndSortControlsStyles: CSS.Properties = {
        padding: "10px 20px",
        width: "250px",
        textAlign: "left"
    };

    return (
        <>
        {/* Adding navbar */}
        <ResponsiveAppBar />

            <Container sx={{justifyContent: "center", display: "grid"}}>
                {/*<h1>Petitions</h1>*/}
                <TextField
                    id="standard-multiline-flexible"
                    label="Search by title or description"
                    type="search"
                    style={{ textAlign: "left", width: "250px", marginTop: "16px" }}
                    variant="outlined"
                    multiline
                    maxRows={3}
                    onChange={(event) => handleInputSearch(event.target.value)}
                />

                <Button onClick={() => setDialogOpen(true)} sx={{margin: "auto"}}>
                    Filter & Sort Petitions
                </Button>
            </Container>


            {/*{petitionCategories.map(category => (*/}
            {/*    <MenuItem value={category.categoryId}>{category.name}</MenuItem>*/}

            {/*))}*/}

            {/*<FormGroup>*/}
            {/*    {petitionCategories.map(category => (*/}
            {/*        <FormControlLabel*/}
            {/*            control={<Checkbox checked={selectedCategories.includes(category.categoryId)} onChange={handleCategoryChange} name={String(category.categoryId)} />}*/}
            {/*            label={category.name}*/}
            {/*            key={category.categoryId}*/}
            {/*        />*/}
            {/*    ))}*/}
            {/*</FormGroup>*/}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>

                <DialogContent>
                    {/* Sorting and Filtering Controls */}
                    <Typography variant="h6">Sort:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl variant="outlined" style={{ minWidth: 120 }}>
                            <InputLabel id="sort-order-label">Sort by</InputLabel>
                            <Select
                                labelId="sort-order-label"
                                value={petitionSortBy}
                                onChange={handleSortByChange}
                                label="Sort by"
                            >
                                <MenuItem value="CREATED_ASC">Oldest</MenuItem>
                                <MenuItem value="CREATED_DESC">Newest</MenuItem>
                                <MenuItem value="ALPHABETICAL_ASC">Alphabetical (A-Z)</MenuItem>
                                <MenuItem value="ALPHABETICAL_DESC">Alphabetical (Z-A)</MenuItem>
                                <MenuItem value="COST_ASC">Support Cost (Asc)</MenuItem>
                                <MenuItem value="COST_DESC">Support Cost (Desc)</MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title="Clear">
                            <IconButton aria-label="clear sort selection" onClick={handleClearSortSelection} sx={{ cursor: 'pointer'}}>
                                <SearchOff />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography variant="h6">Filter by category:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="filter-by-label">Filter by</InputLabel>

                            <Select
                                labelId="filter-by-label"
                                multiple
                                value={selectedCategories}
                                onChange={handleCategoryChange}
                                input={<OutlinedInput id="select-multiple-category" label="Filter by" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((categoryId) => {

                                            const category = petitionCategories.find(cat => cat.categoryId === categoryId);

                                            return category? <Chip key={categoryId} label={category.name} /> :
                                                <Chip key={categoryId} label={categoryId.toString()}/>;
                                        })}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                            >
                                {petitionCategories.map(category => (
                                    <MenuItem
                                        style={getStyles(category, theme)}
                                        key={category.categoryId}
                                        value={category.categoryId}
                                    >
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="Clear">
                            <IconButton aria-label="clear category selection" onClick={handleClearCategorySelection} sx={{ cursor: 'pointer'}}>
                                <SearchOff />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ width: 250, mt: 2 }}>
                        <Typography gutterBottom>Support cost less than or equal to</Typography>
                        <Slider
                            value={supportingCostFilter}
                            onChange={handleSupportingCostChange}
                            aria-labelledby="max-supporting-cost-slider"
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={0}
                            max={100}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>


            <Paper elevation={3} style={card} >

                <h3>Available Petitions</h3>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    padding: "4px"
                }}>
                    <Pagination
                        size={"small"}
                        showFirstButton showLastButton
                        variant="text"
                        color="primary"
                        sx={{justifyContent: "center", alignContent: "center", margin: "auto"}}
                        count={Math.ceil(petitionsCount / 10)} //
                        page={currentPage}
                        onChange={handlePageChange}
                    />
                </Box>


                <Typography sx={{paddingTop: "12px"}}>
                    {`showing ${petitionStartIndex+1}-${Math.min(petitionStartIndex+10, petitionsCount)} of ${petitionsCount} results`}
                </Typography>
                <div style={{ display: "inline-block", maxWidth: "1900px", minWidth: "320", alignItems: "center"}}>
                    {errorFlag ?
                        <Alert severity="error">
                            <AlertTitle> Error </AlertTitle>
                            {errorMessage}
                        </Alert> : ""}

                    {petition_rows()}
                </div>
            </Paper>

        </>
    )
}
export default PetitionList;
