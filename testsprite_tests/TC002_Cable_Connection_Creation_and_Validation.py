import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8005", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click 'Start New Game' to begin placing equipment on the stage.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click on 'Mic Setup' challenge to begin the test.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Drag and place 'Wireless Vocal Mic' and 'Mic Receiver' onto the stage.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Drag and place 'Wireless Vocal Mic' and 'Mic Receiver' onto the stage area.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Drag and drop 'Wireless Vocal Mic' and 'Mic Receiver' from the equipment list onto the stage area.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Drag and drop 'Wireless Vocal Mic' (index 1 or 2) and 'Mic Receiver' (index 3) onto the stage area to place them.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[4]/div[2]/div[2]/div/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assertion: Verify that the connection line appears with correct cable color coding.
        connection_line = frame.locator('.connection-line')
        assert await connection_line.is_visible(), 'Connection line is not visible after making a connection.'
        color = await connection_line.evaluate('(el) => window.getComputedStyle(el).stroke')
        expected_colors = ['rgb(0, 128, 0)', 'rgb(255, 0, 0)', 'rgb(0, 0, 255)']  # Example colors for valid cables
        assert color in expected_colors, f'Connection line color {color} is not correct.'
        
        # Assertion: Confirm real-time validation feedback indicates the connection is valid and correct.
        validation_feedback = frame.locator('.connection-feedback.valid')
        assert await validation_feedback.is_visible(), 'Valid connection feedback is not visible.'
        feedback_text = await validation_feedback.text_content()
        assert 'valid' in feedback_text.lower() or 'correct' in feedback_text.lower(), 'Validation feedback does not indicate a valid connection.'
        
        # Assertion: Check that visual feedback indicates the connection error clearly (color and animation) for invalid connection.
        invalid_feedback = frame.locator('.connection-feedback.invalid')
        assert await invalid_feedback.is_visible(), 'Invalid connection feedback is not visible when making an invalid connection.'
        invalid_color = await invalid_feedback.evaluate('(el) => window.getComputedStyle(el).color')
        expected_invalid_color = 'rgb(255, 0, 0)'  # Red color for error
        assert invalid_color == expected_invalid_color, f'Invalid connection feedback color {invalid_color} is not correct.'
        animation_playing = await invalid_feedback.evaluate('(el) => el.classList.contains("error-animation")')
        assert animation_playing, 'Invalid connection feedback animation is not playing.'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    