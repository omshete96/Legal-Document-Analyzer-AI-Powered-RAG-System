from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_demo_pdf(filename="Sample_NDA.pdf"):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, 750, "NON-DISCLOSURE AGREEMENT")

    c.setFont("Helvetica", 12)
    y = 700
    line_height = 14

    content = [
        "This Non-Disclosure Agreement (the 'Agreement') is entered into by and between:",
        "Party A: Tech Innovators Inc. ('Disclosing Party')",
        "Party B: John Doe ('Receiving Party')",
        "",
        "1. DEFINITION OF CONFIDENTIAL INFORMATION",
        "For purposes of this Agreement, 'Confidential Information' shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged.",
        "",
        "2. OBLIGATIONS",
        "The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.",
        "The Receiving Party shall carefully restrict access to Confidential Information to employees, contractors, and third parties as is reasonably required.",
        "",
        "3. TIME PERIOD",
        "The nondisclosure provisions of this Agreement shall survive the termination of this Agreement and Receiving Party's duty to hold Confidential Information in confidence shall remain in effect until the Confidential Information no longer qualifies as a trade secret or until Disclosing Party sends Receiving Party written notice releasing Receiving Party from this Agreement, whichever occurs first.",
        "",
        "4. TERMINATION",
        "This Agreement may be terminated by either party upon 30 days written notice to the other party. Upon termination, the Receiving Party shall return all Confidential Information.",
        "",
        "5. GOVERNING LAW",
        "This Agreement shall be governed by and construed in accordance with the laws of the State of California.",
        "",
        "6. PENALTIES",
        "In the event of a breach of this Agreement, the Disclosing Party shall be entitled to injunctive relief and may seek damages up to $100,000 for each violation.",
        "",
        "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written."
    ]

    for line in content:
        if y < 50:
            c.showPage()
            y = 750
        c.drawString(50, y, line)
        y -= line_height

    c.save()
    print(f"PDF generated: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_demo_pdf()
