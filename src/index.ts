import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
	Bindings: {
		ENVIRONMENT?: string
	}
}

const app = new Hono<Env>()

// Enable CORS for all routes
app.use('/*', cors())

// Health check endpoint
app.get('/', c => {
	return c.json({
		message: 'Hello from Phoenix Worker!',
		timestamp: new Date().toISOString(),
		environment: c.env.ENVIRONMENT || 'unknown',
	})
})

// API status endpoint
app.get('/api/status', c => {
	return c.json({
		status: 'healthy',
		version: '1.0.0',
	})
})

// 404 handler
app.notFound(c => {
	return c.json(
		{
			error: 'Not Found',
			message: 'The requested resource was not found',
		},
		404,
	)
})

// Error handler
app.onError((err, c) => {
	console.error('Error:', err)
	return c.json(
		{
			error: 'Internal Server Error',
			message: err.message,
		},
		500,
	)
})

export default app
