import * as types from "../constants/addEdit.constants";

import api from "../../apiService";
import { routeActions } from "./route.actions";
import { toast } from "react-toastify";
import axios from "axios";
import foodActions from "./food.actions";

const recipesRequest = (
  pageNum = 1,
  limit = 10,
  query = null,
  ownerId = null,
  sortBy = null
) => async (dispatch) => {
  dispatch({ type: types.RECIPE_REQUEST, payload: null });
  try {
    let queryString = "";
    if (query) {
      queryString = `&name[$regex]=${query}&name[$options]=i`;
    }
    if (ownerId) {
      queryString = `${queryString}&author=${ownerId}`;
    }
    let sortByString = "";
    if (sortBy?.key) {
      sortByString = `&sortBy[${sortBy.key}]=${sortBy.ascending}`;
    }

    const res = await api.get(
      `/recipes?page=${pageNum}&limit=${limit}${queryString}${sortByString}`
    );

    dispatch({
      type: types.RECIPE_REQUEST_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({ type: types.RECIPE_REQUEST_FAILURE, payload: error });
  }
};

const getSingleRecipe = (recipeId) => async (dispatch) => {
  dispatch({ type: types.GET_SINGLE_RECIPE_REQUEST, payload: null });
  try {
    const res = await api.get(`/recipes/${recipeId}`);
    dispatch({
      type: types.GET_SINGLE_RECIPE_REQUEST_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({ type: types.GET_SINGLE_RECIPE_REQUEST_FAILURE, payload: error });
  }
};

const createNewRecipe = (name, images, price, category, info) => async (
  dispatch
) => {
  dispatch({ type: types.CREATE_RECIPE_REQUEST, payload: null });
  try {
    const res = await api.post("/food", {
      name,
      images,
      price,
      category,
      info,
    });

    dispatch({
      type: types.CREATE_RECIPE_SUCCESS,
      payload: res.data.data,
    });
    dispatch(routeActions.redirect("__GO_BACK__"));
    toast.success("New recipe has been created!");
  } catch (error) {
    dispatch({ type: types.CREATE_RECIPE_FAILURE, payload: error });
  }
};

const updateRecipe = (recipeId, name, images, price, category, info) => async (
  dispatch
) => {
  dispatch({ type: types.UPDATE_RECIPE_REQUEST, payload: null });
  try {
    const res = await api.put(`/recipes/${recipeId}`, {
      name,
      price,
      category,
      info,
      images,
    });

    dispatch({
      type: types.UPDATE_RECIPE_SUCCESS,
      payload: res.data.data,
    });
    dispatch(routeActions.redirect("__GO_BACK__"));
    toast.success("The recipe has been updated!");
  } catch (error) {
    dispatch({ type: types.UPDATE_RECIPE_FAILURE, payload: error });
  }
};

const uploadImage = (image, name, type, price) => async (dispatch) => {
  dispatch({ type: types.UPLOAD_IMAGE_REQUEST, payload: null });
  try {
    const imageData = new FormData();
    imageData.append("file", image);
    imageData.append("upload_preset", "saigon");

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/saigonese/image/upload",
      imageData
    );
    dispatch({
      type: types.UPLOAD_IMAGE_SUCCESS,
      payload: res.data.secure_url,
    });
    dispatch(createNewRecipe(name, type, price, res.data.secure_url));
    dispatch(recipesRequest());
    toast.success(`Your Item: ${name} has been created`);
  } catch (error) {
    console.log(error);
    dispatch({ type: types.UPLOAD_IMAGE_FAILURE, payload: error });
  }
};

const deleteRecipe = (foodId) => async (dispatch) => {
  dispatch({ type: types.DELETE_RECIPE_REQUEST, payload: null });
  try {
    const res = await api.delete(`/food/${foodId}`);
    console.log(res);
    dispatch({ type: types.DELETE_RECIPE_SUCCESS, payload: res.data });
    dispatch(foodActions.foodsRequest());
    // dispatch(routeActions.redirect("/menu"));
    toast.success("The recipe has been deleted!");
  } catch (error) {
    dispatch({ type: types.DELETE_RECIPE_FAILURE, payload: error });
  }
};

export const recipeActions = {
  recipesRequest,
  getSingleRecipe,
  createNewRecipe,
  updateRecipe,
  deleteRecipe,
  uploadImage,
};
