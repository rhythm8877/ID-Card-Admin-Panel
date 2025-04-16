// DOM Elements
const searchInput = document.getElementById('searchInput');
const collegeFilter = document.getElementById('collegeFilter');
const degreeFilter = document.getElementById('degreeFilter');
const tableBody = document.getElementById('tableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const resultCount = document.getElementById('resultCount');
const lastUpdated = document.getElementById('lastUpdated');
const exportButton = document.getElementById('exportButton');

// Student data store
let allStudents = [];
let filteredStudents = [];

// Event listeners for search and filters
searchInput.addEventListener('input', applyFilters);
collegeFilter.addEventListener('change', applyFilters);
degreeFilter.addEventListener('change', applyFilters);
exportButton.addEventListener('click', exportToExcel);

// Initial data load
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
});

// Function to fetch students from Firestore
function fetchStudents() {
    loadingIndicator.style.display = 'block';
    emptyState.style.display = 'none';
    
    db.collection('idCards')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            allStudents = [];
            querySnapshot.forEach((doc) => {
                const studentData = doc.data();
                studentData.id = doc.id;
                allStudents.push(studentData);
            });
            
            filteredStudents = [...allStudents];
            renderStudents();
            updateLastUpdatedTime();
            loadingIndicator.style.display = 'none';
        })
        .catch((error) => {
            console.error("Error fetching student data: ", error);
            loadingIndicator.style.display = 'none';
            emptyState.textContent = 'Error loading student data. Please try again.';
            emptyState.style.display = 'block';
        });
}

// Function to apply filters based on search input and dropdown selections
function applyFilters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCollege = collegeFilter.value;
    const selectedDegree = degreeFilter.value;
    
    filteredStudents = allStudents.filter(student => {
        // Search filter (case insensitive)
        const matchesSearch = searchTerm === '' || 
            student.name.toLowerCase().includes(searchTerm) || 
            (student.registrationNumber && student.registrationNumber.toLowerCase().includes(searchTerm)) || 
            (student.email && student.email.toLowerCase().includes(searchTerm));
        
        // College filter
        const matchesCollege = selectedCollege === '' || student.college === selectedCollege;
        
        // Degree filter
        const matchesDegree = selectedDegree === '' || student.degree === selectedDegree;
        
        return matchesSearch && matchesCollege && matchesDegree;
    });
    
    renderStudents();
}

// Function to render students in the table
function renderStudents() {
    tableBody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            
            // Create cells with data attributes for responsive view
            const nameCell = document.createElement('td');
            nameCell.setAttribute('data-label', 'Name');
            nameCell.textContent = student.name || '';
            
            const regNumCell = document.createElement('td');
            regNumCell.setAttribute('data-label', 'Registration Number');
            regNumCell.textContent = student.registrationNumber || '';
            
            const contactCell = document.createElement('td');
            contactCell.setAttribute('data-label', 'Contact');
            contactCell.textContent = student.contact || '';
            
            const emailCell = document.createElement('td');
            emailCell.setAttribute('data-label', 'Email');
            emailCell.textContent = student.email || '';
            
            const collegeCell = document.createElement('td');
            collegeCell.setAttribute('data-label', 'College');
            collegeCell.textContent = student.college || '';
            
            const degreeCell = document.createElement('td');
            degreeCell.setAttribute('data-label', 'Degree');
            degreeCell.textContent = student.degree || '';
            
            // Append cells to row
            row.appendChild(nameCell);
            row.appendChild(regNumCell);
            row.appendChild(contactCell);
            row.appendChild(emailCell);
            row.appendChild(collegeCell);
            row.appendChild(degreeCell);
            
            // Append row to table body
            tableBody.appendChild(row);
        });
    }
    
    // Update the result count
    resultCount.textContent = `${filteredStudents.length} ${filteredStudents.length === 1 ? 'student' : 'students'}`;
}

// Update the last updated time
function updateLastUpdatedTime() {
    const now = new Date();
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString([], options)}`;
}

// Function to export data to Excel
function exportToExcel() {
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Determine which data to export (filtered or all)
    const dataToExport = filteredStudents.length > 0 ? filteredStudents : allStudents;
    
    // Map the data to a more Excel-friendly format
    const excelData = dataToExport.map(student => ({
        'Name': student.name || '',
        'Registration Number': student.registrationNumber || '',
        'Contact': student.contact || '',
        'Email': student.email || '',
        'College': student.college || '',
        'Degree': student.degree || '',
        'Created At': student.createdAt instanceof Date ? 
            student.createdAt.toLocaleString() : 
            (student.createdAt && student.createdAt.toDate ? 
                student.createdAt.toDate().toLocaleString() : 
                '')
    }));
    
    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    // Generate Excel file and trigger download
    const fileName = `student_data_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    // Show brief success message
    const originalText = exportButton.textContent;
    exportButton.textContent = '✓ Excel Downloaded';
    exportButton.disabled = true;
    
    setTimeout(() => {
        exportButton.innerHTML = '<span class="btn-icon">📊</span>Export to Excel';
        exportButton.disabled = false;
    }, 2000);
}