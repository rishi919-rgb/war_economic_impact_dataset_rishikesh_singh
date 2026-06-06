import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc      Get API version and metadata information
 * @route     GET /version
 * @access    Public
 */
export const getVersion = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    name: 'War Economic Impact API',
    version: '1.0.0',
    description: 'A production-grade REST API managing global conflict economic impacts (unemployment, inflation, poverty, GDP loss, black market activity, war cost, and reconstruction cost).',
    environment: process.env.NODE_ENV || 'development',
  });
});
