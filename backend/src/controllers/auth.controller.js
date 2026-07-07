import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * @desc      Register new user in system
 * @route     POST /auth/register
 * @access    Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const result = await authService.registerUser({ name, email, password, role });
  
  return new ApiResponse(
    HTTP_STATUS.CREATED,
    'User registered successfully.',
    result
  ).send(res);
});

/**
 * @desc      Authenticate user credentials and return session token
 * @route     POST /auth/login
 * @access    Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.loginUser(email, password);
  
  return new ApiResponse(
    HTTP_STATUS.OK,
    'User logged in successfully.',
    result
  ).send(res);
});

/**
 * @desc      Terminates user session
 * @route     POST /auth/logout
 * @access    Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Stateless JWT logout is handled client-side (by discarding the token).
  // The server registers a confirmation response.
  return new ApiResponse(
    HTTP_STATUS.OK,
    'User logged out successfully. Please clear the local Bearer token.'
  ).send(res);
});

/**
 * @desc      Retrieves active session profile payload
 * @route     GET /auth/me
 * @access    Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // The user object is injected into the request state by the protect middleware.
  return new ApiResponse(
    HTTP_STATUS.OK,
    'Active profile details retrieved successfully.',
    req.user
  ).send(res);
});

/**
 * @desc      Updates active session profile details
 * @route     PUT /auth/update
 * @access    Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateUserProfile(req.user._id, req.body);
  
  return new ApiResponse(
    HTTP_STATUS.OK,
    'User profile updated successfully.',
    result
  ).send(res);
});
