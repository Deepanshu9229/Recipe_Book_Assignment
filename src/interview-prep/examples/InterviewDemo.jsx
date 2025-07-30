import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, List, Grid, Modal as ModalIcon, User, Calendar, DollarSign } from 'lucide-react';

// Import all components
import Pagination, { SimplePagination, PaginationWithPageSize } from '../components/Pagination/Pagination';
import FilterSystem, { SimpleSearch } from '../components/Filtering/FilterSystem';
import SortableTable, { MultiSortTable, SortButtons, useSort } from '../components/Sorting/SortableTable';
import InfiniteScroll, { VirtualInfiniteScroll, InfiniteGrid } from '../components/InfiniteScroll/InfiniteScroll';
import DebouncedSearch, { AdvancedDebouncedSearch, CachedDebouncedSearch } from '../components/DebouncedSearch/DebouncedSearch';
import Modal, { ConfirmModal, AlertModal, FormModal, useModal, Drawer } from '../components/Modal/Modal';

// Import hooks
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';

/**
 * COMPREHENSIVE INTERVIEW DEMO
 * 
 * This component demonstrates all the interview preparation components
 * working together in realistic scenarios that you might encounter
 * in frontend interviews.
 */

// Mock data for demonstrations
const generateMockData = (count = 100) => {
  const categories = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Design'];
  const technologies = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Swift', 'Flutter'];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Airbnb'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Developer ${index + 1}`,
    email: `developer${index + 1}@example.com`,
    category: categories[Math.floor(Math.random() * categories.length)],
    technology: technologies[Math.floor(Math.random() * technologies.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    salary: Math.floor(Math.random() * 100000) + 50000,
    experience: Math.floor(Math.random() * 10) + 1,
    date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    skills: technologies.slice(0, Math.floor(Math.random() * 4) + 1),
    rating: Math.floor(Math.random() * 5) + 1,
    available: Math.random() > 0.3
  }));
};

const InterviewDemo = () => {
  const [currentDemo, setCurrentDemo] = useState('overview');
  const [mockData] = useState(() => generateMockData(200));
  
  // Modal states
  const confirmModal = useModal();
  const alertModal = useModal();
  const formModal = useModal();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Demo data states
  const [filteredData, setFilteredData] = useState(mockData);
  const [selectedItems, setSelectedItems] = useState([]);

  const demos = [
    { id: 'overview', title: 'Overview', icon: <Grid size={16} /> },
    { id: 'pagination', title: 'Pagination', icon: <List size={16} /> },
    { id: 'filtering', title: 'Filtering', icon: <Filter size={16} /> },
    { id: 'sorting', title: 'Sorting', icon: <ArrowUpDown size={16} /> },
    { id: 'search', title: 'Search & Debouncing', icon: <Search size={16} /> },
    { id: 'infinite', title: 'Infinite Scroll', icon: <List size={16} /> },
    { id: 'modals', title: 'Modals & Dialogs', icon: <ModalIcon size={16} /> },
    { id: 'combined', title: 'Combined Features', icon: <Grid size={16} /> }
  ];

  const renderDemo = () => {
    switch (currentDemo) {
      case 'overview':
        return <OverviewDemo />;
      case 'pagination':
        return <PaginationDemo data={filteredData} />;
      case 'filtering':
        return <FilteringDemo data={mockData} onFilteredData={setFilteredData} />;
      case 'sorting':
        return <SortingDemo data={filteredData} />;
      case 'search':
        return <SearchDemo />;
      case 'infinite':
        return <InfiniteScrollDemo />;
      case 'modals':
        return <ModalsDemo />;
      case 'combined':
        return <CombinedDemo data={mockData} />;
      default:
        return <OverviewDemo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Frontend Interview Preparation Demo
          </h1>
          <p className="text-gray-600 mt-1">
            Interactive examples of common React interview questions and implementations
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Components</h2>
              <ul className="space-y-2">
                {demos.map((demo) => (
                  <li key={demo.id}>
                    <button
                      onClick={() => setCurrentDemo(demo.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentDemo === demo.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {demo.icon}
                      <span>{demo.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderDemo()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={() => {
          // Simulate async action
          setTimeout(() => {
            confirmModal.closeModal();
            alertModal.openModal();
          }, 1000);
        }}
        title="Delete Items"
        message="Are you sure you want to delete the selected items? This action cannot be undone."
        type="danger"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.closeModal}
        title="Success!"
        message="Items have been successfully deleted."
        type="success"
        autoClose={true}
      />

      <FormModal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        onSubmit={(e) => {
          e.preventDefault();
          setTimeout(() => {
            formModal.closeModal();
          }, 1000);
        }}
        title="Add New Developer"
        submitText="Add Developer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Frontend</option>
              <option>Backend</option>
              <option>Mobile</option>
              <option>DevOps</option>
            </select>
          </div>
        </div>
      </FormModal>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Developer Details"
        position="right"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">John Developer</h3>
              <p className="text-gray-600">Senior Frontend Developer</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign size={16} />
                <span>Salary</span>
              </div>
              <p className="text-lg font-semibold">$95,000</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Experience</span>
              </div>
              <p className="text-lg font-semibold">5 years</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Node.js', 'GraphQL'].map(skill => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

// Individual demo components
const OverviewDemo = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Frontend Interview Preparation Components
      </h2>
      <p className="text-gray-600 mb-6">
        This demo showcases comprehensive implementations of common frontend interview questions.
        Each component is production-ready and demonstrates best practices for React development.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        {
          title: "Pagination",
          description: "Multiple pagination styles with performance optimization",
          features: ["Client-side pagination", "Server-side pagination", "Page size selection", "Accessibility support"]
        },
        {
          title: "Filtering",
          description: "Advanced filtering system with multiple filter types",
          features: ["Text search", "Category filters", "Range filters", "Multi-select filters"]
        },
        {
          title: "Sorting",
          description: "Sortable tables with multiple sort criteria",
          features: ["Single column sort", "Multi-column sort", "Custom sort functions", "Visual indicators"]
        },
        {
          title: "Search & Debouncing",
          description: "Optimized search with debouncing and caching",
          features: ["Debounced input", "API caching", "Error handling", "Loading states"]
        },
        {
          title: "Infinite Scroll",
          description: "Performance-optimized infinite scrolling",
          features: ["Intersection Observer", "Virtual scrolling", "Error recovery", "Grid layouts"]
        },
        {
          title: "Modals & Dialogs",
          description: "Accessible modal system with React Portal",
          features: ["Focus management", "Keyboard navigation", "Multiple modal types", "Drawer component"]
        }
      ].map((component, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {component.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {component.description}
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            {component.features.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Interview Tips
      </h3>
      <ul className="text-blue-800 space-y-2">
        <li>• Always explain your thought process while coding</li>
        <li>• Consider edge cases and error handling</li>
        <li>• Discuss performance implications and optimizations</li>
        <li>• Mention accessibility and user experience</li>
        <li>• Be prepared to extend or modify your implementations</li>
      </ul>
    </div>
  </div>
);

const PaginationDemo = ({ data }) => {
  const pagination = usePagination({
    totalItems: data.length,
    initialPageSize: 10
  });

  const paginatedData = pagination.getPageItems(data);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Pagination Examples</h2>
      
      <div className="space-y-8">
        {/* Standard Pagination */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Standard Pagination</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map(item => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.company}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              ))}
            </div>
            
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.pageSize}
              onPageChange={pagination.goToPage}
              maxVisiblePages={5}
            />
          </div>
        </div>

        {/* Pagination with Page Size */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Pagination with Page Size Control</h3>
          <PaginationWithPageSize
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.pageSize}
            onPageChange={pagination.goToPage}
            onPageSizeChange={pagination.changePageSize}
          />
        </div>

        {/* Simple Pagination */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Simple Pagination</h3>
          <SimplePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
          />
        </div>
      </div>
    </div>
  );
};

const FilteringDemo = ({ data, onFilteredData }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-gray-900">Filtering Examples</h2>
    
    <FilterSystem
      data={data}
      onFilteredData={onFilteredData}
    />
    
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Simple Search Example</h3>
      <SimpleSearch
        placeholder="Search developers..."
        onSearch={(value) => console.log('Search:', value)}
      />
    </div>
  </div>
);

const SortingDemo = ({ data }) => {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'company', title: 'Company' },
    { key: 'category', title: 'Category' },
    { 
      key: 'salary', 
      title: 'Salary',
      render: (value) => `$${value.toLocaleString()}`
    },
    { key: 'experience', title: 'Experience (years)' }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Sorting Examples</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Column Sorting</h3>
        <SortableTable
          data={data.slice(0, 10)}
          columns={columns}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Multi-Column Sorting</h3>
        <MultiSortTable
          data={data.slice(0, 10)}
          columns={columns}
        />
      </div>
    </div>
  );
};

const SearchDemo = () => (
  <div className="space-y-8">
    <h2 className="text-xl font-bold text-gray-900">Search & Debouncing Examples</h2>
    
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Debounced Search</h3>
      <DebouncedSearch delay={300} />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Advanced Search with API</h3>
      <AdvancedDebouncedSearch />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Search with Caching</h3>
      <CachedDebouncedSearch />
    </div>
  </div>
);

const InfiniteScrollDemo = () => {
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`
  })));

  const loadMore = () => {
    setTimeout(() => {
      setItems(prev => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => ({
          id: prev.length + i + 1,
          name: `Item ${prev.length + i + 1}`,
          description: `Description for item ${prev.length + i + 1}`
        }))
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Infinite Scroll Examples</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Infinite Scroll</h3>
        <div className="h-96 border border-gray-200 rounded-lg p-4">
          <InfiniteScroll
            items={items}
            loadMore={loadMore}
            hasNextPage={items.length < 100}
            renderItem={(item) => (
              <div className="p-3 border-b border-gray-100">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            )}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Infinite Grid</h3>
        <InfiniteGrid
          items={items}
          loadMore={loadMore}
          hasNextPage={items.length < 100}
          columns={3}
          renderItem={(item) => (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          )}
        />
      </div>
    </div>
  );
};

const ModalsDemo = () => {
  const confirmModal = useModal();
  const alertModal = useModal();
  const formModal = useModal();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Modal Examples</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={confirmModal.openModal}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Confirm Modal
        </button>
        
        <button
          onClick={alertModal.openModal}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Alert Modal
        </button>
        
        <button
          onClick={formModal.openModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Form Modal
        </button>
        
        <button
          onClick={() => setDrawerOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Open Drawer
        </button>
      </div>

      {/* Modal implementations would be rendered at the app level */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Click the buttons above to see different modal types in action.
          All modals include accessibility features like focus management and keyboard navigation.
        </p>
      </div>
    </div>
  );
};

const CombinedDemo = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const pagination = usePagination({
    totalItems: filteredData.length,
    initialPageSize: 8
  });

  const paginatedData = pagination.getPageItems(filteredData);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'company', title: 'Company' },
    { key: 'category', title: 'Category' },
    { 
      key: 'salary', 
      title: 'Salary',
      render: (value) => `$${value.toLocaleString()}`
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Combined Features Demo</h2>
      <p className="text-gray-600">
        This example combines filtering, sorting, and pagination in a realistic data table scenario.
      </p>
      
      {/* Filtering */}
      <FilterSystem
        data={data}
        onFilteredData={(filtered) => {
          setFilteredData(filtered);
          pagination.firstPage(); // Reset to first page when filters change
        }}
      />
      
      {/* Sortable Table */}
      <SortableTable
        data={paginatedData}
        columns={columns}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalItems={filteredData.length}
        itemsPerPage={pagination.pageSize}
        onPageChange={pagination.goToPage}
        maxVisiblePages={5}
      />
    </div>
  );
};

export default InterviewDemo;