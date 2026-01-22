// generateApiDocWithRoles.js
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from "docx";
import fs from "fs";

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "EndoNurse LMS API Routes (with Roles & Auth)",
                    heading: "Heading1",
                    spacing: { after: 300 },
                }),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: ["Route", "Method", "Description", "Request Body / Params", "Response", "Auth Required", "Role Required"].map(
                                (header) =>
                                    new TableCell({
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        children: [
                                            new Paragraph({
                                                children: [new TextRun({ text: header, bold: true })],
                                            }),
                                        ],
                                    })
                            ),
                        }),
                        // --- Add all API routes with auth info ---
                        ...[
                            ["/api/auth/signup","POST","Register a new user (trainee/instructor/admin)","{first_name, last_name, email, password, role, title}","{message, user, emailSent}","No","Any"],
                            ["/api/auth/login","POST","Login user and return JWT","{email, password}","{message, user}","No","Any"],
                            ["/api/users/","GET","Get all users","N/A","Array of users","Yes","Admin"],
                            ["/api/users/","POST","Add a user","{first_name, last_name, email, password, role, title}","{message, user, emailSent}","Yes","Admin"],
                            ["/api/users/:id","DELETE","Delete a user","id in URL","{message}","Yes","Admin"],
                            ["/api/users/reset-password","POST","Reset user password","{email, newPassword}","{message}","Yes","Admin"],
                            ["/api/users/:userId/upload-profile","POST","Upload profile picture","form-data: profile_picture","{message, user}","Yes","Any (Owner)"],
                            ["/api/users/admin_contents","GET","List all admin/library contents","N/A","Array of contents","Yes","Admin"],
                            ["/api/users/admin_contents","POST","Add a library content","form-data: title, description, image","{message, content}","Yes","Admin"],
                            ["/api/users/admin_contents/:id","PUT","Update library content","id in URL, form-data: title, description, image","{message, content}","Yes","Admin"],
                            ["/api/users/admin_contents/:id","DELETE","Delete a library content","id in URL","{message}","Yes","Admin"],
                            ["/api/users/modules","GET","List all modules","N/A","Array of modules","Yes","Any"],
                            ["/api/users/modules","POST","Add a module","{title, instructor_id}","{message, module}","Yes","Admin/Instructor"],
                            ["/api/users/modules/:id","DELETE","Delete a module","id in URL","{message}","Yes","Admin/Instructor"],
                            ["/api/users/modules/:moduleId/contents","GET","List all instructor contents for a module","moduleId in URL","Array of contents","Yes","Any"],
                            ["/api/users/modules/:moduleId/attach_content/:contentId","POST","Attach library content to module","moduleId & contentId in URL","{message}","Yes","Instructor"],
                            ["/api/users/contents/:contentId","DELETE","Delete instructor content","contentId in URL","{message}","Yes","Instructor"],
                            ["/api/users/contents/enroll","POST","Enroll trainees to content","{content_id, trainee_ids[]}","{message}","Yes","Instructor"],
                            ["/api/users/trainees","GET","List all trainees","N/A","Array of trainees","Yes","Admin/Instructor"],
                            ["/api/users/modules/enrollments","GET","Get modules with enrolled trainees","N/A","Array of modules with enrollments","Yes","Admin/Instructor"],
                            ["/api/users/my-courses/:traineeId","GET","Get modules assigned to a trainee","traineeId in URL","Array of modules with contents","Yes","Trainee"],
                        ].map((row) => 
                            new TableRow({
                                children: row.map(cell => new TableCell({
                                    children: [new Paragraph(cell)]
                                }))
                            })
                        )
                    ]
                })
            ]
        }
    ]
});

// Write file
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("EndoNurse_LMS_API_Routes_With_Roles.docx", buffer);
    console.log("✅ EndoNurse_LMS_API_Routes_With_Roles.docx has been created successfully!");
});
