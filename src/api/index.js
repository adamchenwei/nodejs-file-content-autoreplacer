import { description, version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/description', (req, res) => {
		res.json({ description });
	});

  api.get('/version', (req, res) => {
    res.json({ version });
  });

	return api;
}
