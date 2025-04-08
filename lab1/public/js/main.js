document.addEventListener("DOMContentLoaded", function () {
	// DOM Elements
	const passportForm = document.getElementById("passportForm");
	const recordIdInput = document.getElementById("recordId");
	const photoInput = document.getElementById("photo");
	const photoPreview = document.getElementById("photoPreview");
	const resetBtn = document.getElementById("resetBtn");
	const recordsList = document.getElementById("recordsList");
	const showJsonBtn = document.getElementById("showJsonBtn");
	const showXmlBtn = document.getElementById("showXmlBtn");
	const dataView = document.getElementById("dataView");
	const dataContent = document.getElementById("dataContent");

	// Load records when page loads
	loadRecords();

	// Form submission handler
	passportForm.addEventListener("submit", function (e) {
		e.preventDefault();

		const formData = new FormData(passportForm);
		const url = recordIdInput.value
			? `/api/passports/${recordIdInput.value}`
			: "/api/passports";
		const method = recordIdInput.value ? "PUT" : "POST";

		fetch(url, {
			method: method,
			body: formData,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				alert(data.message);
				resetForm();
				loadRecords();
			})
			.catch((error) => {
				console.error("Error:", error);
				alert(
					"There was a problem with your request. Please try again."
				);
			});
	});

	// Reset form button handler
	resetBtn.addEventListener("click", function () {
		resetForm();
	});

	// Show JSON data button handler
	showJsonBtn.addEventListener("click", function () {
		fetch("/api/passports/format/json")
			.then((response) => response.text())
			.then((data) => {
				dataContent.textContent = data;
				dataView.style.display = "block";
			})
			.catch((error) => console.error("Error:", error));
	});

	// Show XML data button handler
	showXmlBtn.addEventListener("click", function () {
		fetch("/api/passports/format/xml")
			.then((response) => response.text())
			.then((data) => {
				dataContent.textContent = data;
				dataView.style.display = "block";
			})
			.catch((error) => console.error("Error:", error));
	});

	// Photo preview handler
	photoInput.addEventListener("change", function (e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function (e) {
				photoPreview.innerHTML = `<img src="${e.target.result}" alt="Photo preview">`;
				photoPreview.style.display = "block";
			};
			reader.readAsDataURL(file);
		} else {
			photoPreview.innerHTML = "";
			photoPreview.style.display = "none";
		}
	});

	// Function to load records from the server
	function loadRecords() {
		fetch("/api/passports")
			.then((response) => response.json())
			.then((data) => {
				renderRecords(data);
			})
			.catch((error) => console.error("Error:", error));
	}

	// Function to render records in the table
	function renderRecords(records) {
		recordsList.innerHTML = "";

		if (records.length === 0) {
			const row = document.createElement("tr");
			row.innerHTML =
				'<td colspan="3" style="text-align: center;">No records found</td>';
			recordsList.appendChild(row);
			return;
		}

		records.forEach((record) => {
			const row = document.createElement("tr");

			// Create full name cell
			const fullName = `${record.lastName} ${record.firstName} ${record.middleName}`;
			const nameCell = document.createElement("td");
			nameCell.textContent = fullName;

			// Create ID number cell
			const idCell = document.createElement("td");
			idCell.textContent = record.idNumber;

			// Create actions cell with edit and delete buttons
			const actionsCell = document.createElement("td");
			actionsCell.className = "action-buttons";

			const editBtn = document.createElement("button");
			editBtn.className = "edit-btn";
			editBtn.textContent = "Edit";
			editBtn.addEventListener("click", () => editRecord(record.id));

			const deleteBtn = document.createElement("button");
			deleteBtn.className = "delete-btn";
			deleteBtn.textContent = "Delete";
			deleteBtn.addEventListener("click", () => deleteRecord(record.id));

			actionsCell.appendChild(editBtn);
			actionsCell.appendChild(deleteBtn);

			// Append cells to row
			row.appendChild(nameCell);
			row.appendChild(idCell);
			row.appendChild(actionsCell);

			// Append row to table
			recordsList.appendChild(row);
		});
	}

	// Function to edit a record
	function editRecord(id) {
		fetch(`/api/passports/${id}`)
			.then((response) => response.json())
			.then((record) => {
				// Populate the form with record data
				recordIdInput.value = record.id;
				document.getElementById("lastName").value = record.lastName;
				document.getElementById("firstName").value = record.firstName;
				document.getElementById("middleName").value = record.middleName;
				document.getElementById("address").value = record.address;
				document.getElementById("idNumber").value = record.idNumber;

				// Show photo preview if available
				if (record.photoUrl) {
					photoPreview.innerHTML = `<img src="${record.photoUrl}" alt="Photo preview">`;
					photoPreview.style.display = "block";
				} else {
					photoPreview.innerHTML = "";
					photoPreview.style.display = "none";
				}

				// Scroll to form
				passportForm.scrollIntoView({ behavior: "smooth" });
			})
			.catch((error) => console.error("Error:", error));
	}

	// Function to delete a record
	function deleteRecord(id) {
		if (confirm("Are you sure you want to delete this record?")) {
			fetch(`/api/passports/${id}`, {
				method: "DELETE",
			})
				.then((response) => response.json())
				.then((data) => {
					alert(data.message);
					loadRecords();
				})
				.catch((error) => console.error("Error:", error));
		}
	}

	// Function to reset the form
	function resetForm() {
		recordIdInput.value = "";
		passportForm.reset();
		photoPreview.innerHTML = "";
		photoPreview.style.display = "none";
	}
});
