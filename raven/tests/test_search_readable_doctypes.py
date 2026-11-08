from unittest.mock import patch

import frappe
from frappe.core.doctype.doctype.test_doctype import new_doctype
from frappe.tests import IntegrationTestCase

from raven.api.document_link import search_readable_doctypes


class TestSearchReadableDoctypes(IntegrationTestCase):
	def setUp(self):
		self.doctype = new_doctype(
			"Raven Hidden Test Doc", permissions=[{"role": "System Manager", "read": 1}]
		).insert()
		self.user = frappe.get_doc("User", "test2@example.com")
		self.user.remove_roles("System Manager")

	def tearDown(self):
		frappe.db.rollback()
		frappe.set_user("Administrator")

	def names(self, txt="Raven Hidden"):
		return [row["value"] for row in search_readable_doctypes(txt=txt)]

	def test_doctype_without_read_permission_is_not_offered(self):
		frappe.set_user("test2@example.com")
		self.assertNotIn(self.doctype.name, self.names())

	def test_doctype_with_read_permission_is_offered(self):
		frappe.set_user("Administrator")
		self.assertIn(self.doctype.name, self.names())

	def test_doctype_with_its_own_tab_is_not_offered_even_when_readable(self):
		frappe.set_user("Administrator")
		self.assertIn(self.doctype.name, self.names())
		with patch("raven.api.document_link.ATTACHED_ELSEWHERE", [self.doctype.name]):
			self.assertNotIn(self.doctype.name, self.names())
