#!/usr/bin/env node
/**
 * Comprehensive App Audit Script
 * Uses Puppeteer to crawl the app and check for errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const AUDIT_RESULTS = {
  pages: [],
  errors: [],
  warnings: [],
  consoleErrors: [],
  consoleWarnings: [],
  brokenLinks: [],
  missingAssets: [],
  performance: [],
  accessibility: [],
  summary: {
    totalPages: 0,
    workingPages: 0,
    brokenPages: 0,
    totalErrors: 0,
    totalWarnings: 0,
  }
};

async function auditPage(browser, url, pageName) {
  console.log(`\n🔍 Auditing: ${pageName} (${url})`);
  
  const page = await browser.newPage();
  const pageResults = {
    name: pageName,
    url,
    status: 'unknown',
    errors: [],
    warnings: [],
    consoleErrors: [],
    consoleWarnings: [],
    loadTime: 0,
    brokenLinks: [],
    missingImages: [],
  };

  const startTime = Date.now();

  try {
    // Set up console listeners
    const consoleMessages = [];
    const networkErrors = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        pageResults.consoleErrors.push(text);
        AUDIT_RESULTS.consoleErrors.push({ page: pageName, error: text });
      } else if (type === 'warning') {
        pageResults.consoleWarnings.push(text);
        AUDIT_RESULTS.consoleWarnings.push({ page: pageName, warning: text });
      }
      consoleMessages.push({ type, text });
    });

    page.on('pageerror', (error) => {
      pageResults.errors.push(error.message);
      AUDIT_RESULTS.errors.push({ page: pageName, error: error.message });
    });

    page.on('requestfailed', (request) => {
      const url = request.url();
      const failure = request.failure();
      if (failure && !url.includes('favicon')) {
        networkErrors.push({ url, error: failure.errorText });
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          pageResults.missingImages.push(url);
        } else {
          pageResults.brokenLinks.push(url);
        }
      }
    });

    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;
    pageResults.loadTime = loadTime;

    if (response) {
      pageResults.status = response.status();
      
      if (response.status() >= 400) {
        pageResults.errors.push(`HTTP ${response.status()}: ${response.statusText()}`);
        AUDIT_RESULTS.summary.brokenPages++;
      } else {
        AUDIT_RESULTS.summary.workingPages++;
      }
    }

    // Check for common issues
    const pageContent = await page.content();
    
    // Check for missing images
    const imageElements = await page.$$eval('img', (imgs) =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt || '',
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }))
    );

    for (const img of imageElements) {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        pageResults.missingImages.push(img.src);
      }
    }

    // Check for broken internal links
    const links = await page.$$eval('a[href]', (anchors) =>
      anchors
        .map(a => a.href)
        .filter(href => href.startsWith(BASE_URL) || href.startsWith('/'))
    );

    // Check accessibility basics
    const hasTitle = await page.$('title');
    const hasMain = await page.$('main, [role="main"]');
    const hasHeading = await page.$('h1, h2, h3, h4, h5, h6');

    if (!hasTitle) {
      pageResults.warnings.push('Missing <title> tag');
    }
    if (!hasMain) {
      pageResults.warnings.push('Missing main content landmark');
    }
    if (!hasHeading) {
      pageResults.warnings.push('Missing heading elements');
    }

    // Performance metrics
    const metrics = await page.metrics();
    pageResults.performance = {
      jsHeapUsedSize: metrics.JSHeapUsedSize,
      jsHeapTotalSize: metrics.JSHeapTotalSize,
      nodes: metrics.Nodes,
    };

    console.log(`  ✅ Status: ${pageResults.status}`);
    console.log(`  ⏱️  Load time: ${loadTime}ms`);
    console.log(`  ❌ Errors: ${pageResults.errors.length}`);
    console.log(`  ⚠️  Warnings: ${pageResults.warnings.length}`);
    console.log(`  🔴 Console errors: ${pageResults.consoleErrors.length}`);
    console.log(`  🟡 Console warnings: ${pageResults.consoleWarnings.length}`);

  } catch (error) {
    pageResults.status = 'error';
    pageResults.errors.push(error.message);
    AUDIT_RESULTS.errors.push({ page: pageName, error: error.message });
    AUDIT_RESULTS.summary.brokenPages++;
    console.log(`  ❌ Failed: ${error.message}`);
  } finally {
    await page.close();
  }

  AUDIT_RESULTS.pages.push(pageResults);
  AUDIT_RESULTS.summary.totalPages++;
  AUDIT_RESULTS.summary.totalErrors += pageResults.errors.length;
  AUDIT_RESULTS.summary.totalWarnings += pageResults.warnings.length;

  return pageResults;
}

async function runAudit() {
  console.log('🚀 Starting Comprehensive App Audit...\n');
  console.log('='.repeat(60));

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      console.error(`❌ Server not responding at ${BASE_URL}`);
      console.error('Please start the server with: npm run dev:3002');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Cannot connect to ${BASE_URL}`);
    console.error('Please start the server with: npm run dev:3002');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Audit main pages
    const pagesToAudit = [
      { url: `${BASE_URL}/`, name: 'Home Page' },
      { url: `${BASE_URL}/test-language-detection`, name: 'Language Detection Test' },
      { url: `${BASE_URL}/test-lds`, name: 'LDS Integration Test' },
    ];

    for (const page of pagesToAudit) {
      await auditPage(browser, page.url, page.name);
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${AUDIT_RESULTS.summary.totalPages}`);
  console.log(`✅ Working: ${AUDIT_RESULTS.summary.workingPages}`);
  console.log(`❌ Broken: ${AUDIT_RESULTS.summary.brokenPages}`);
  console.log(`🔴 Total Errors: ${AUDIT_RESULTS.summary.totalErrors}`);
  console.log(`🟡 Total Warnings: ${AUDIT_RESULTS.summary.totalWarnings}`);
  console.log(`🔴 Console Errors: ${AUDIT_RESULTS.consoleErrors.length}`);
  console.log(`🟡 Console Warnings: ${AUDIT_RESULTS.consoleWarnings.length}`);

  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'AUDIT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(AUDIT_RESULTS, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Generate markdown report
  generateMarkdownReport();

  return AUDIT_RESULTS;
}

function generateMarkdownReport() {
  const reportPath = path.join(__dirname, '..', 'AUDIT_REPORT.md');
  let markdown = '# 🔍 Comprehensive App Audit Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  markdown += '## 📊 Summary\n\n';
  markdown += `- **Total Pages Audited:** ${AUDIT_RESULTS.summary.totalPages}\n`;
  markdown += `- **✅ Working Pages:** ${AUDIT_RESULTS.summary.workingPages}\n`;
  markdown += `- **❌ Broken Pages:** ${AUDIT_RESULTS.summary.brokenPages}\n`;
  markdown += `- **🔴 Total Errors:** ${AUDIT_RESULTS.summary.totalErrors}\n`;
  markdown += `- **🟡 Total Warnings:** ${AUDIT_RESULTS.summary.totalWarnings}\n\n`;

  markdown += '## 📄 Page Details\n\n';
  for (const page of AUDIT_RESULTS.pages) {
    markdown += `### ${page.name}\n\n`;
    markdown += `- **URL:** ${page.url}\n`;
    markdown += `- **Status:** ${page.status}\n`;
    markdown += `- **Load Time:** ${page.loadTime}ms\n`;
    
    if (page.errors.length > 0) {
      markdown += `\n**Errors:**\n`;
      page.errors.forEach(err => markdown += `- ❌ ${err}\n`);
    }
    
    if (page.warnings.length > 0) {
      markdown += `\n**Warnings:**\n`;
      page.warnings.forEach(warn => markdown += `- ⚠️ ${warn}\n`);
    }
    
    if (page.consoleErrors.length > 0) {
      markdown += `\n**Console Errors:**\n`;
      page.consoleErrors.forEach(err => markdown += `- 🔴 ${err}\n`);
    }
    
    if (page.brokenLinks.length > 0) {
      markdown += `\n**Broken Links:**\n`;
      page.brokenLinks.forEach(link => markdown += `- 🔗 ${link}\n`);
    }
    
    markdown += '\n';
  }

  if (AUDIT_RESULTS.consoleErrors.length > 0) {
    markdown += '## 🔴 Console Errors\n\n';
    AUDIT_RESULTS.consoleErrors.forEach(({ page, error }) => {
      markdown += `- **${page}:** ${error}\n`;
    });
    markdown += '\n';
  }

  fs.writeFileSync(reportPath, markdown);
  console.log(`📄 Markdown report saved to: ${reportPath}`);
}

// Run audit
runAudit()
  .then(() => {
    console.log('\n✅ Audit complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });



