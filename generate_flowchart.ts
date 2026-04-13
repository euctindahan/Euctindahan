
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import * as fs from 'fs';

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "Tindahang Envergista - Application Flowchart & System Documentation",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "\n1. CUSTOMER JOURNEY (BUYER FLOW)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Explanation: ", bold: true }),
                        new TextRun({ text: "This flow outlines the experience of a student looking to purchase items within the campus community. It focuses on ease of discovery and secure transaction handling." }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "\nStep-by-Step Process:", bold: true }),
                        new TextRun({ text: "\n• START: Landing Page - Introduction to the marketplace features." }),
                        new TextRun({ text: "\n• Login / Sign Up: Secure access using Google Authentication to verify student identity." }),
                        new TextRun({ text: "\n• Marketplace (Shop): Browsing products with real-time search and category filters." }),
                        new TextRun({ text: "\n• Product Interaction: Viewing detailed descriptions and initiating real-time chats with sellers for inquiries." }),
                        new TextRun({ text: "\n• Cart & Checkout: Adding items to a virtual bag and selecting payment methods (GCash for digital or COD for face-to-face)." }),
                        new TextRun({ text: "\n• Order Tracking: Real-time status updates from 'Preparing' to 'Delivered'." }),
                        new TextRun({ text: "\n• Feedback: Rating and reviewing products to build community trust." }),
                    ],
                }),

                new Paragraph({
                    text: "\n2. SELLER JOURNEY (MERCHANT FLOW)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Explanation: ", bold: true }),
                        new TextRun({ text: "This flow describes how a student transitions into an entrepreneur. It provides tools for inventory management and order fulfillment tracking." }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "\nStep-by-Step Process:", bold: true }),
                        new TextRun({ text: "\n• Onboarding: A user applies to become a seller via their profile page." }),
                        new TextRun({ text: "\n• Seller Dashboard: A central hub to monitor total sales, active orders, and pending commission (tax) owed to the admin." }),
                        new TextRun({ text: "\n• Inventory Management: Adding new products with images, pricing, and stock levels." }),
                        new TextRun({ text: "\n• Order Fulfillment: Receiving notifications, accepting orders, and updating shipping status." }),
                        new TextRun({ text: "\n• Financial Settlement: Tracking earnings after the platform's commission is deducted." }),
                    ],
                }),

                new Paragraph({
                    text: "\n3. ADMIN JOURNEY (SYSTEM GOVERNANCE)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Explanation: ", bold: true }),
                        new TextRun({ text: "The Admin flow is designed for platform oversight, ensuring safety, moderation, and financial integrity of the marketplace." }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "\nStep-by-Step Process:", bold: true }),
                        new TextRun({ text: "\n• Secure Access: Multi-layered login requiring verified admin credentials and a secure passcode." }),
                        new TextRun({ text: "\n• User Moderation: Ability to block/unblock users to maintain a safe community environment." }),
                        new TextRun({ text: "\n• Global Monitoring: Oversight of all transactions and chat logs to resolve disputes." }),
                        new TextRun({ text: "\n• Financial Control: Managing the 'Listing Tax' (commission rate) and verifying that sellers have remitted their dues." }),
                        new TextRun({ text: "\n• System Configuration: Updating global assets like the hero image and toggling system-wide features." }),
                    ],
                }),

                new Paragraph({
                    text: "\n4. TAX & COMMISSION LOGIC (REVENUE MODEL)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Explanation: ", bold: true }),
                        new TextRun({ text: "The system uses a commission-based model where the platform takes a small percentage of each successful sale to cover maintenance and administrative costs." }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "\nOperational Logic:", bold: true }),
                        new TextRun({ text: "\n1. Calculation: When an order is placed, the system calculates the tax based on the current 'Listing Tax Rate' set by the admin." }),
                        new TextRun({ text: "\n2. Accrual: Once an order is marked as 'Delivered', the tax amount is officially recorded as 'Owed' by the seller." }),
                        new TextRun({ text: "\n3. Remittance: Sellers pay the accumulated tax to the admin through external channels (e.g., direct GCash or cash)." }),
                        new TextRun({ text: "\n4. Verification: The admin confirms receipt of payment and marks the tax as 'Paid' in the system, clearing the seller's balance." }),
                    ],
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Tindahang_Envergista_Documentation.docx", buffer);
    console.log("English Documentation Word document created successfully!");
});
