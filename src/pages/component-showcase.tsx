/**
 * Component Showcase Page
 * Demonstrates all UI components in a single page
 */
import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { 
  Button, 
  Input, 
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Alert,
  Toast,
  ToastProvider,
  Spinner,
  Badge,
  Modal,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  Tabs,
  Pagination
} from '../components/ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPlus, 
  faEdit, 
  faTrash,
  faCheck,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const ComponentShowcase: NextPage = () => {
  // State for interactive components
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sample data for Select component
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true }
  ];
  
  // Sample data for RadioGroup component
  const radioOptions = [
    { value: 'radio1', label: 'Radio Option 1' },
    { value: 'radio2', label: 'Radio Option 2' },
    { value: 'radio3', label: 'Radio Option 3' },
    { value: 'radio4', label: 'Radio Option 4 (Disabled)', disabled: true }
  ];
  
  // Sample data for Tabs component
  const tabItems = [
    { 
      label: 'Tab 1', 
      content: <div className="p-4 bg-white rounded-md">Content for Tab 1</div> 
    },
    { 
      label: 'Tab 2', 
      content: <div className="p-4 bg-white rounded-md">Content for Tab 2</div> 
    },
    { 
      label: 'Tab 3', 
      content: <div className="p-4 bg-white rounded-md">Content for Tab 3</div> 
    },
    { 
      label: 'Disabled', 
      content: <div className="p-4 bg-white rounded-md">This tab is disabled</div>,
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Component Showcase - Health Appointment System</title>
        <meta name="description" content="Showcase of UI components for the Health Appointment System" />
      </Head>

      <ToastProvider>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Showcase</h1>
          
          {/* Buttons Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Buttons</h2>
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Variants</h3>
                    <div className="space-y-2">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="info">Info</Button>
                      <Button variant="light">Light</Button>
                      <Button variant="dark">Dark</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sizes</h3>
                    <div className="space-y-2">
                      <Button size="xs">Extra Small</Button>
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">States</h3>
                    <div className="space-y-2">
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                      <Button icon={faPlus}>With Icon</Button>
                      <Button icon={faEdit} iconPosition="right">Icon Right</Button>
                      <Button fullWidth>Full Width</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Shapes</h3>
                    <div className="space-y-2">
                      <Button>Default</Button>
                      <Button rounded>Rounded</Button>
                      <Button variant="primary" icon={faPlus} rounded>Add</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Form Elements Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Form Elements</h2>
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input 
                      label="Email" 
                      placeholder="Enter your email" 
                      type="email" 
                      icon={faEnvelope}
                      helperText="We'll never share your email with anyone else."
                    />
                    
                    <Input 
                      label="Password" 
                      placeholder="Enter your password" 
                      type="password" 
                      icon={faLock}
                      error="Password must be at least 8 characters long."
                    />
                    
                    <Textarea 
                      label="Message" 
                      placeholder="Enter your message" 
                      rows={4}
                      maxLength={200}
                      showCharacterCount
                      helperText="Please be concise and clear."
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Select 
                      label="Select Option" 
                      options={selectOptions} 
                      placeholder="Choose an option"
                      helperText="Select the best option for you."
                    />
                    
                    <RadioGroup 
                      label="Radio Options" 
                      name="radio-group" 
                      options={radioOptions}
                      helperText="Select one option only."
                    />
                    
                    <div className="space-y-2">
                      <Checkbox 
                        label="I agree to the terms and conditions" 
                        helperText="You must agree before submitting."
                      />
                      
                      <Checkbox 
                        label="Send me promotional emails" 
                        defaultChecked
                      />
                      
                      <Checkbox 
                        label="Disabled option" 
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Cards Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>A basic card with just content.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a simple card with some content. Cards are useful for displaying related information in a contained unit.</p>
                </CardContent>
              </Card>
              
              <Card variant="elevated" hoverable>
                <CardHeader divider>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>An elevated card with hover effect.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card has an elevated style with a shadow and hover effect. It also has a divider between the header and content.</p>
                </CardContent>
                <CardFooter divider>
                  <div className="flex justify-end space-x-2">
                    <Button variant="light" size="sm">Cancel</Button>
                    <Button size="sm">Save</Button>
                  </div>
                </CardFooter>
              </Card>
              
              <Card variant="bordered" clickable onClick={() => alert('Card clicked!')}>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPlus} className="h-10 w-10 text-blue-500 mb-2" />
                      <p className="text-gray-700">Click to add new item</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Feedback Components Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feedback Components</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alerts</h3>
                <Alert variant="info" title="Information">This is an informational alert.</Alert>
                <Alert variant="success" title="Success">Your changes have been saved successfully.</Alert>
                <Alert variant="warning" title="Warning">Your account is about to expire.</Alert>
                <Alert variant="error" title="Error" dismissible onDismiss={() => console.log('Alert dismissed')}>
                  There was an error processing your request.
                </Alert>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Toasts</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => setToastOpen(true)}>Show Toast</Button>
                </div>
                <Toast 
                  title="Notification"
                  description="This is a toast notification."
                  variant="success"
                  open={toastOpen}
                  onOpenChange={setToastOpen}
                  duration={3000}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Spinners</h3>
                <div className="flex flex-wrap gap-4">
                  <Spinner size="xs" />
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner size="xl" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Spinner variant="primary" label="Loading..." />
                  <Spinner variant="success" label="Processing..." labelPosition="right" />
                  <Spinner variant="danger" label="Please wait" labelPosition="bottom" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" pill>Pill</Badge>
                  <Badge variant="success" outline>Outline</Badge>
                  <Badge variant="danger" size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </section>
          
          {/* Overlay Components Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overlay Components</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Modal</h3>
                <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                <Modal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Modal Title"
                  footer={
                    <>
                      <Button variant="light" onClick={() => setModalOpen(false)}>Cancel</Button>
                      <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                    </>
                  }
                >
                  <p>This is a modal dialog. It's useful for displaying content that requires user interaction before continuing.</p>
                  <div className="mt-4">
                    <Input label="Sample Input" placeholder="Type something..." />
                  </div>
                </Modal>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dropdown</h3>
                <Dropdown
                  trigger={
                    <Button variant="secondary" icon={faChevronDown} iconPosition="right">
                      Dropdown Menu
                    </Button>
                  }
                >
                  <DropdownItem icon={faUser} onSelect={() => console.log('Profile clicked')}>
                    Profile
                  </DropdownItem>
                  <DropdownItem icon={faEdit} onSelect={() => console.log('Edit clicked')}>
                    Edit
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem icon={faTrash} onSelect={() => console.log('Delete clicked')}>
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
          </section>
          
          {/* Navigation Components Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Navigation Components</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tabs</h3>
                <Tabs tabs={tabItems} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pagination</h3>
                <Pagination
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </section>
        </div>
      </ToastProvider>
    </div>
  );
};

export default ComponentShowcase;
