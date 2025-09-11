#!/usr/bin/env node

import { Command } from 'commander';
import { EbayExporter } from './exporter';
import chalk from 'chalk';

const program = new Command();

program
  .name('closet-hopper')
  .description('Export eBay listings for Closet Hopper')
  .version('1.0.0');

program
  .command('export')
  .description('Export eBay listings to folders')
  .option('-u, --username <username>', 'eBay username')
  .option('-o, --output <path>', 'Output directory', './export')
  .option('-l, --limit <number>', 'Maximum number of listings to export', '100')
  .option('--headless', 'Run browser in headless mode', true)
  .action(async (options) => {
    try {
      console.log(chalk.blue('🦘 Closet Hopper Exporter'));
      console.log(chalk.gray('Exporting your eBay listings...\n'));

      if (!options.username) {
        console.error(chalk.red('Error: eBay username is required'));
        console.log(chalk.yellow('Usage: closet-hopper export -u your-ebay-username'));
        process.exit(1);
      }

      const exporter = new EbayExporter({
        username: options.username,
        outputDir: options.output,
        limit: parseInt(options.limit),
        headless: options.headless
      });

      await exporter.export();
      
      console.log(chalk.green('\n✅ Export completed successfully!'));
      console.log(chalk.blue('📁 Check your export folder for the listings'));
      console.log(chalk.yellow('🔄 Now drag the folders into Poshmark with the Closet Hopper extension'));
      
    } catch (error) {
      console.error(chalk.red('Export failed:'), error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate exported listings')
  .option('-d, --directory <path>', 'Directory containing exported listings', './export')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Validating exported listings...\n'));
      
      const exporter = new EbayExporter({ username: '', outputDir: options.directory, limit: 0, headless: true });
      const results = await exporter.validateExports();
      
      console.log(chalk.green(`✅ Validated ${results.valid} listings`));
      if (results.invalid > 0) {
        console.log(chalk.red(`❌ Found ${results.invalid} invalid listings`));
      }
      
    } catch (error) {
      console.error(chalk.red('Validation failed:'), error);
      process.exit(1);
    }
  });

program.parse();
