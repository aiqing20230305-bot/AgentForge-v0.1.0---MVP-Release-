/**
 * Integration Routes
 * API routes for Slack and Discord integrations
 */

import { Router } from 'express'
import { integrationController } from './integrationController'

const router = Router()

// Slack endpoints
router.post('/slack/commands', (req, res) => integrationController.handleSlackCommand(req, res))
router.get('/slack/oauth/callback', (req, res) => integrationController.handleSlackOAuth(req, res))

// Discord endpoints
router.post('/discord/interactions', (req, res) => integrationController.handleDiscordInteraction(req, res))
router.get('/discord/oauth/callback', (req, res) => integrationController.handleDiscordOAuth(req, res))

// Generic endpoints
router.post('/webhook', (req, res) => integrationController.handleWebhook(req, res))
router.get('/status', (req, res) => integrationController.getStatus(req, res))
router.post('/test/:platform', (req, res) => integrationController.testConnection(req, res))

export default router
