import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api";
import { useAuth } from "../../context/AuthContext";

const EnrollTraineeInstructor = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ==================== FETCH ENROLLMENTS ====================
  const fetchEnrollments = async () => {
    if (!user?.id) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/users/modules/enrollments`,
        { params: { instructor_id: user.id } }
      );
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load enrollment data");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    const interval = setInterval(fetchEnrollments, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // ==================== PAGINATION ====================
  const totalRows = data.reduce(
    (sum, module) => sum + (module.contents.length || 1),
    0
  );

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  let displayedRows = [];
  let rowCount = 0;

  for (let module of data) {
    const contents =
      module.contents.length > 0
        ? module.contents
        : [
            {
              id: `no-content-${module.id}`,
              title: "No content added",
              enrolledTrainees: [],
            },
          ];

    contents.forEach((content, index) => {
      rowCount++;

      if (
        rowCount > (currentPage - 1) * rowsPerPage &&
        rowCount <= currentPage * rowsPerPage
      ) {
        displayedRows.push({
          module,
          content,
          index,
          rowSpan: contents.length,
        });
      }
    });
  }

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ==================== RENDER ====================
  return (
    <div className="container py-4 page-content">
      <ToastContainer />
      <h2 className="mb-4">Modules, Contents & Enrollments</h2>

      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <Form.Select
          style={{ width: "auto" }}
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </Form.Select>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span>
            {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)}–
            {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Module Title</th>
              <th>Content Title</th>
              <th>Enrolled Trainees</th>
              <th>Trainee IDs</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map(({ module, content, index, rowSpan }) => (
                <tr key={content.id}>
                  {index === 0 && content.title !== "No content added" && (
                    <td rowSpan={rowSpan}>{module.title}</td>
                  )}

                  {content.title === "No content added" && (
                    <td>{module.title}</td>
                  )}

                  <td>{content.title}</td>

                  <td>
                    {content.enrolledTrainees?.length > 0 ? (
                      <ul className="mb-0 ps-3">
                        {content.enrolledTrainees.map((t) => (
                          <li key={t.trainee_id}>
                            {t.first_name} {t.last_name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No trainees enrolled"
                    )}
                  </td>

                  <td>
                    {content.enrolledTrainees?.length > 0 ? (
                      <ul className="mb-0 ps-3">
                        {content.enrolledTrainees.map((t) => (
                          <li key={t.trainee_id}>{t.trainee_id}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">
                  No modules found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default EnrollTraineeInstructor;
